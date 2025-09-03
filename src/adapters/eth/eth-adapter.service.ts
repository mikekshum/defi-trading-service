import { Inject, Injectable } from "@nestjs/common";
import { Contract, ethers } from "ethers";
import { IFeeData } from "./types/fee-data.type";
import { IPairMetadata } from "./types/pair-metadata.type";
import { EthAdapterGasPriceFetchException } from "./exceptions/eth-adapter-gas-price-fetch.exception";
import { EthAdapterFactoryContractCallException } from "./exceptions/eth-adapter-factory-contract-call.exception";
import { EthAdapterPairContractCallException } from "./exceptions/eth-adapter-pair-contract-call.exception";
import { AppLoggerService } from "../../logger/app-logger.service";

import UniswapV2FactoryABI from "./abi/uniswap-v2-factory.json";
import UniswapV2PairABI from "./abi/uniswap-v2-pair.json";
import ERC20ABI from "./abi/erc-20.json";
import { EthAdapterTokenContractCallException } from "./exceptions/eth-adapter-token-contract-call.exception";

export interface IEthAdapterServiceConfig {
    ethRpcUri: string;
    uniswapV2FactoryAddress: string;
}


@Injectable()
export class EthAdapterService {
    private provider: ethers.JsonRpcProvider;
    private uniswapV2FactoryContract: Contract;

    constructor(
        private readonly appLoggerService: AppLoggerService,
        @Inject("ETH_ADAPTER_CONFIG")
        config: IEthAdapterServiceConfig
    ) {
        console.log(config)
        this.provider = new ethers.JsonRpcProvider(config.ethRpcUri);
        this.uniswapV2FactoryContract = new ethers.Contract(config.uniswapV2FactoryAddress, UniswapV2FactoryABI, this.provider);

        this.appLoggerService.setContext(this.constructor.name);
    }

    // Returns a pair address if exists, throws error if not found
    async getUniswapV2PairContractAddress(tokenA: string, tokenB: string): Promise<string> {
        this.appLoggerService.debug("Fetching Uniswap V2 pair contract address...", { tokenA, tokenB });

        let pairContractAddress: string;
        try {
            pairContractAddress = await this.uniswapV2FactoryContract.getPair(tokenA, tokenB);
        } catch (ex) {
            this.appLoggerService.error("Failed to fetch pair contract address from Uniswap V2 factory", { error: ex });
            throw new EthAdapterFactoryContractCallException("Failed to get pair");
        }

        this.appLoggerService.debug("Pair contract address fetched", { tokenA, tokenB, pairContractAddress });

        return pairContractAddress;
    }

    // Returns necessary uniswap v2 pair metadata
    async getUniswapV2PairContractMetadata(pairContractAddress: string): Promise<IPairMetadata> {
        this.appLoggerService.debug("Fetching Uniswap V2 pair contract metadata...", { pairContractAddress });

        const pairContract = new ethers.Contract(pairContractAddress, UniswapV2PairABI, this.provider);

        // Getting reserves for both tokens
        let pairReserves: bigint[];
        try {
            pairReserves = await pairContract.getReserves();
        } catch (ex) {
            this.appLoggerService.error("Failed to fetch pair reserves", { pairContractAddress, error: ex });
            throw new EthAdapterPairContractCallException("Failed to get reserves");
        }

        this.appLoggerService.debug("Pair reserves fetched", { pairContractAddress, pairReserves });

        // pairs can be returned in random order. Getting token0 to map them -> tokenFrom, tokenTo
        let pairToken0: string;
        try {
            pairToken0 = await pairContract.token0() as string;
        } catch (ex) {
            this.appLoggerService.error("Failed to fetch token0 from pair contract", { pairContractAddress, error: ex });
            throw new EthAdapterPairContractCallException("Failed to get token0");
        }

        this.appLoggerService.debug("Token0 fetched", { pairContractAddress, pairToken0 });

        return {
            token0: pairToken0,
            reserve0: BigInt(pairReserves[0]),
            reserve1: BigInt(pairReserves[1])
        };
    }

    // Fetches fee data from the network
    async getFeeData(): Promise<IFeeData> {
        this.appLoggerService.debug("Fetching fee data from provider");

        let feeData: ethers.FeeData | null;

        try {
            feeData = await this.provider.getFeeData();
        } catch (ex) {
            this.appLoggerService.error("Failed to fetch fee data from provider", { error: ex });
            throw new EthAdapterGasPriceFetchException("Failed to fetch fee data");
        }

        this.appLoggerService.debug("Fee data fetched", { feeData });

        // The returned feeData may be null
        if (!feeData.gasPrice) {
            this.appLoggerService.error("Gas price is null in fetched fee data", { feeData });
            throw new EthAdapterGasPriceFetchException("Gas price is null");
        }

        return {
            maxFeePerGas: feeData.maxFeePerGas,
            gasPrice: feeData.gasPrice,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        };
    }

    // Returns the decimals of an ERC20 token
    async getERC20Decimals(tokenAddress: string): Promise<number> {
        this.appLoggerService.debug("Fetching ERC20 token decimals...", { tokenAddress });

        const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, this.provider);

        let decimals: number;
        try {
            decimals = await tokenContract.decimals();
        } catch (ex) {
            this.appLoggerService.error("Failed to fetch ERC20 token decimals", { tokenAddress, error: ex });
            throw new EthAdapterTokenContractCallException("Failed to get ERC20 decimals");
        }

        this.appLoggerService.debug("ERC20 token decimals fetched", { tokenAddress, decimals });

        return decimals;
    }
}
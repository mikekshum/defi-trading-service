import { Inject, Injectable } from "@nestjs/common";
import { Contract, ethers } from "ethers";

import UniswapV2FactoryABI from "./abi/uniswap-v2-factory.json";
import UniswapV2PairABI from "./abi/uniswap-v2-pair.json";
import { IFeeData } from "./types/fee-data.type";
import { IPairMetadata } from "./types/pair-metadata.type";
import { EthAdapterGasPriceFetchException } from "./exceptions/eth-adapter-gas-price-fetch.exception";
import { EthAdapterFactoryContractCallException } from "./exceptions/eth-adapter-factory-contract-call.exception";
import { EthAdapterPairContractCallException } from "./exceptions/eth-adapter-pair-contract-call.exception";

@Injectable()
export class EthAdapterService {
    private provider: ethers.JsonRpcProvider;
    private uniswapV2FactoryContract: Contract;

    constructor(
        @Inject('rpcUri')
        rpcUri: string, 
        @Inject('uniswapV2FactoryContractAddress')
        uniswapV2FactoryContractAddress: string
    ) {
        this.provider = new ethers.JsonRpcProvider(rpcUri);
        this.uniswapV2FactoryContract = new ethers.Contract(uniswapV2FactoryContractAddress, UniswapV2FactoryABI, this.provider);
    }

    // Returns a pair address if exists, throws error if not found
    async getUniswapV2PairContractAddress(tokenA: string, tokenB: string): Promise<string> {
        let pairContractAddress: string;
        try {
            pairContractAddress = await this.uniswapV2FactoryContract.getPair(tokenA, tokenB);
        } catch (ex) {
            throw new EthAdapterFactoryContractCallException("Failed to get pair");
        }

        return pairContractAddress;
    }

    // Returns necessary uniswap v2 pair metadata
    async getUniswapV2PairContractMetadata(pairContractAddress: string): Promise<IPairMetadata> {
        const pairContract = new ethers.Contract(pairContractAddress, UniswapV2PairABI, this.provider);

        // Getting reserves for both tokens
        let pairReserves: bigint[];
        try {
            pairReserves = await pairContract.getReserves();
        } catch (ex) {
            throw new EthAdapterPairContractCallException("Failed to get reserves");
        }

        // pairs can be returned in random order. Getting token0 to map them -> tokenFrom, tokenTo
        let pairToken0: string;
        try {
            pairToken0 = await pairContract.token0() as string;
        } catch (ex) {
            throw new EthAdapterPairContractCallException("Failed to get token0");
        }

        return {
            token0: pairToken0,
            reserve0: BigInt(pairReserves[0]),
            reserve1: BigInt(pairReserves[1])
        };
    }

    // Fetches fee data from the network
    async getFeeData(): Promise<IFeeData> {
        let feeData: ethers.FeeData | null;

        try {
            feeData = await this.provider.getFeeData();
        } catch (ex) {
            throw new EthAdapterGasPriceFetchException("Failed to fetch fee data");
        }

        // The returned feeData may be null
        if (!feeData.gasPrice) {
            throw new EthAdapterGasPriceFetchException("Gas price is null");
        }

        return {
            maxFeePerGas: feeData.maxFeePerGas,
            gasPrice: feeData.gasPrice,
            maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        };
    }
}
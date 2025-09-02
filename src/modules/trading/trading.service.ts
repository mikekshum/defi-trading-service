import { Injectable, OnModuleInit } from "@nestjs/common";
import { Contract, ethers } from "ethers";
import { AppConfigService } from "src/config/app-config.service";
import { TradingGasPriceFetchException } from "./exceptions/trading-gas-price-fetch.exception";

import UniswapV2FactoryABI from "src/modules/trading/abi/uniswap-v2-factory.json";
import UniswapV2PairABI from "src/modules/trading/abi/uniswap-v2-pair.json";
import { IGasPriceCache } from "./types/gas-price-cache.type";
import { TradingFactoryContractCallException } from "./exceptions/trading-factory-contract-call.exception";
import { TradingPairContractCallException } from "./exceptions/trading-pair-contract-call.exception";

@Injectable()
export class TradingService implements OnModuleInit {
    private provider: ethers.JsonRpcProvider;
    private uniswapFactoryContract: Contract;

    private gasPriceCache: IGasPriceCache | null = null;

    constructor(
        private readonly appConfigService: AppConfigService
    ) {
        this.provider = new ethers.JsonRpcProvider(this.appConfigService.ethRpcUri)

        this.uniswapFactoryContract = new ethers.Contract(this.appConfigService.uniswapV2FactoryAddress, UniswapV2FactoryABI, this.provider);
    }

    // Initialize gas price caching process
    public async onModuleInit() {
        try {
            await this.updateGasPriceCache();
        } catch (err) {
            console.error('Failed to initialize gas price cache', err);
        }
    }

    // Returns the current recommended gas price from the network in WEI as a string
    public async getGasPrice(): Promise<IGasPriceCache> {
        if (!this.gasPriceCache) {
            // It may throw an exception if something wrong
            await this.updateGasPriceCache();
        }

        return this.gasPriceCache!;
    }

    // Returns estimated token return as a string
    public async getTokenReturn(
        tokenFrom: string,
        tokenTo: string,
        amountIn: string
    ): Promise<string> {
        // Get UniswapV2Pair contract address
        let pairContractAddress: string;
        try {
            pairContractAddress = await this.uniswapFactoryContract.getPair(tokenFrom, tokenTo);
        } catch (ex) {
            throw new TradingFactoryContractCallException('Failed to get pair');
        }

        const pairContract = new ethers.Contract(pairContractAddress, UniswapV2PairABI, this.provider);

        // Getting reserves for both tokens
        let pairReserves: bigint[];
        try {
            pairReserves = await pairContract.getReserves();
        } catch (ex) {
            throw new TradingPairContractCallException('Failed to get reserves');
        }

        // pairs can be returned in random order. Getting token0 to map them -> tokenFrom, tokenTo
        let pairToken0: string;
        try {
            pairToken0 = await pairContract.token0() as string;
        } catch (ex) {
            throw new TradingPairContractCallException('Failed to get token0');
        }

        let tokenFromReserve: bigint;
        let tokenToReserve: bigint;

        if (pairToken0 == tokenFrom) {
            tokenFromReserve = pairReserves[0];
            tokenToReserve = pairReserves[1];
        } else {
            tokenFromReserve = pairReserves[1];
            tokenToReserve = pairReserves[0];
        }

        // Convert to bigint
        const amountInBigInt = BigInt(amountIn)

        // Uniswap v2 takes 0.03% from the input amount, so the actual amount to be extracted from the pool is amountIn - 0.03%
        // x * 997 / 1000 takes exactly 0.03%
        const amountInAvailable = amountInBigInt * 997n / 1000n;

        // For more information on the formula, see https://rareskills.io/post/uniswap-v2-price-impact
        const tokenFromReserveAfter = tokenFromReserve + amountInAvailable;
        const expectedAmountOut = tokenToReserve - ((tokenFromReserve * tokenToReserve) / tokenFromReserveAfter);

        return expectedAmountOut.toString();
    }

    // To be called inside GasPriceCacheScheduler, updates the gas price cache
    public async updateGasPriceCache(): Promise<void> {
        // Check TTL if it's valid for update
        if (this.gasPriceCache) {
            const now = new Date();
            const life = now.getTime() - this.gasPriceCache.timestamp.getTime();

            if (life < this.appConfigService.gasPriceCacheTTLMs) return;
        }

        let feeData: ethers.FeeData | null;

        try {
            feeData = await this.provider.getFeeData();
        } catch (ex) {
            throw new TradingGasPriceFetchException('Failed to fetch fee data');
        }

        // The returned feeData may be null
        if (!feeData.gasPrice) {
            throw new TradingGasPriceFetchException('Gas price is null');
        }

        const gasPrice = feeData.gasPrice.toString();
        const now = new Date();

        this.gasPriceCache = {
            value: gasPrice,
            timestamp: now
        };
    }
}
import { Injectable, OnModuleInit } from "@nestjs/common";
import { AppConfigService } from "../../config/app-config.service";
import { IGasPriceCache } from "./types/gas-price-cache.type";
import { calculateUniswapV2Return } from "../../common/utils";
import { AppLoggerService } from "../../logger/app-logger.service";
import { EthAdapterService } from "../../adapters/eth/eth-adapter.service";
import { IFeeData } from "../../adapters/eth/types/fee-data.type";
import { TradingEthAdapterFailedException } from "./exceptions/trading-eth-adapter-failed.exception";
import { IPairMetadata } from "../../adapters/eth/types/pair-metadata.type";
import { ethers } from "ethers";
import { ETH_DECIMALS } from "../../common/static";

@Injectable()
export class TradingService implements OnModuleInit {
    private gasPriceCache: IGasPriceCache | null = null;

    constructor(
        private readonly ethAdapterService: EthAdapterService,
        private readonly appConfigService: AppConfigService,
        private readonly appLoggerService: AppLoggerService
    ) {
        // Logger context as the class name
        this.appLoggerService.setContext(this.constructor.name);
    }

    // Initialize gas price caching process
    public async onModuleInit() {
        try {
            await this.updateGasPriceCache();
        } catch (err) {
            console.error("Failed to initialize gas price cache", err);
        }
    }

    // Returns the current recommended gas price from the network in WEI as a string
    public async getGasPrice(): Promise<IGasPriceCache> {
        this.appLoggerService.debug("Getting gas price...", { gasPriceCache: this.gasPriceCache });

        if (!this.gasPriceCache) {
            this.appLoggerService.debug("Gas price cache is null, updating");
            await this.updateGasPriceCache();
        }

        this.appLoggerService.debug("Gas price returned", { gasPriceCache: this.gasPriceCache });

        return this.gasPriceCache!;
    }

    // Returns estimated token return as a string
    public async getTokenReturn(
        tokenFrom: string,
        tokenTo: string,
        amountIn: string
    ): Promise<string> {
        this.appLoggerService.debug("Getting token return...", {
            tokenFrom,
            tokenTo,
            amountIn
        });

        this.appLoggerService.debug("Trying to fetch pair contract address for tokens...", {
            tokenFrom,
            tokenTo
        });

        // Get UniswapV2Pair contract address
        let pairContractAddress: string;
        try {
            pairContractAddress = await this.ethAdapterService.getUniswapV2PairContractAddress(tokenFrom, tokenTo);
        } catch (ex) {
            this.appLoggerService.error("Eth adapter failed to fetch pair contract address", { error: ex });
            throw new TradingEthAdapterFailedException("Eth adapter failed to fetch pair contract address");
        }

        this.appLoggerService.debug("Pair contract address fetched, trying to fetch pair contract metadata...", {
            pairContractAddress
        });

        // Get UniswapV2Pair contract metadata
        let pairContractMetadata: IPairMetadata;
        try {
            pairContractMetadata = await this.ethAdapterService.getUniswapV2PairContractMetadata(pairContractAddress);
        } catch (ex) {
            this.appLoggerService.error("Eth adapter failed to fetch pair contract metadata", { error: ex });
            throw new TradingEthAdapterFailedException("Eth adapter failed to fetch pair contract on-chain data");
        }

        this.appLoggerService.debug("Pair contract metadata fetched, trying to fetch pair contract metadata...", {
            pairContractAddress,
        });

        // We have to match to token0 to validate the reserves order
        let tokenFromReserve: bigint;
        let tokenToReserve: bigint;

        if (pairContractMetadata.token0 == tokenFrom) {
            tokenFromReserve = pairContractMetadata.reserve0;
            tokenToReserve = pairContractMetadata.reserve1;
        } else {
            tokenFromReserve = pairContractMetadata.reserve1;
            tokenToReserve = pairContractMetadata.reserve0;
        }

        // Convert to bigint
        const amountInBigInt = BigInt(amountIn)

        // See the function
        const amountOut = calculateUniswapV2Return(
            amountInBigInt,
            tokenFromReserve,
            tokenToReserve
        );

        this.appLoggerService.debug("AmountOut returned", {
            amountOut,
        });

        return amountOut.toString();
    }

    // To be called inside GasPriceCacheScheduler, updates the gas price cache
    public async updateGasPriceCache(): Promise<void> {
        this.appLoggerService.debug("Trying to update gas price...");

        // Check TTL if it's valid for update
        if (this.gasPriceCache) {
            const now = new Date();
            const life = now.getTime() - this.gasPriceCache.timestamp.getTime();

            if (life < this.appConfigService.gasPriceCacheTTLMs) {
                this.appLoggerService.debug("Gas price cache is valid. Cancel", {
                    gasPriceTimestamp: this.gasPriceCache.timestamp,
                    gasPriceLife: life,
                    ttl: this.appConfigService.gasPriceCacheTTLMs
                });
                return;
            };
        }

        this.appLoggerService.debug("Gas price is expired, fetching...");

        let feeData: IFeeData;

        try {
            feeData = await this.ethAdapterService.getFeeData();
        } catch (ex) {
            this.appLoggerService.error("Eth adapter failed to fetch fee data", { error: ex })
            throw new TradingEthAdapterFailedException("Eth adapter failed to fetch fee data");
        }

        const gasPrice = feeData.gasPrice.toString();
        const now = new Date();

        this.appLoggerService.debug("Gas price successfully updated")

        this.gasPriceCache = {
            value: gasPrice,
            timestamp: now
        };
    }
}
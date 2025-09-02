import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

// Provides type-safe access to environment variables
@Injectable()
export class AppConfigService {
    constructor(
        private readonly configService: ConfigService
    ) {}

    // App

    public get port(): number {
        return this.configService.getOrThrow<number>('PORT');
    }

    // ETH

    public get ethRpcApiKey(): string {
        return this.configService.getOrThrow<string>('ETH_RPC_API_KEY');
    }

    public get ethRpcChainId(): number {
        return this.configService.getOrThrow<number>('ETH_RPC_CHAIN_ID');
    }

    public get gasPriceCacheTTLMs(): number {
        return this.configService.getOrThrow<number>('GAS_CACHE_TTL_MS')
    }

    // Uniswap v2

    public get uniswapV2FactoryAddress(): string {
        return this.configService.getOrThrow<string>('UNISWAP_V2_FACTORY_ADDRESS');
    }

    // Too needlessly complicated to implement dynamic
    // public get uniswapV2TradingFee(): number {
    //     return this.configService.getOrThrow<number>('UNISWAP_v2_TRADING_FEE');
    // }
}
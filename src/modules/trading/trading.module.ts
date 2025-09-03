import { Module } from "@nestjs/common";
import { AppConfigModule } from "src/config/app-config.module";
import { AppLoggerModule } from "src/logger/app-logger.module";
import { TradingController } from "./trading.controller";
import { TradingService } from "./trading.service";
import { GasPriceCacheScheduler } from "./schedulers/gas-price-cache.scheduler";
import { EthAdapterModule, IEthAdapterConfig } from "src/adapters/eth/eth-adapter.module";
import { AppConfigService } from "src/config/app-config.service";

@Module({
    imports: [
        EthAdapterModule.registerAsync({
            imports: [AppConfigModule],
            useFactory: (configService: AppConfigService): IEthAdapterConfig => ({
                ethRpcUri: configService.ethRpcUri,
                uniswapV2FactoryAddress: configService.uniswapV2FactoryAddress,
            }),
            inject: [AppConfigService],
        }),

        AppConfigModule,
        AppLoggerModule
    ],
    controllers: [
        TradingController
    ],
    providers: [
        TradingService,
        GasPriceCacheScheduler
    ]
})
export class TradingModule { }
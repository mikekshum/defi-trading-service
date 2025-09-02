import { Module } from "@nestjs/common";
import { AppConfigModule } from "src/config/app-config.module";
import { AppLoggerModule } from "src/logger/app-logger.module";
import { TradingController } from "./trading.controller";
import { TradingService } from "./trading.service";
import { GasPriceCacheScheduler } from "./schedulers/gas-price-cache.scheduler";

@Module({
    imports: [
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
export class TradingModule {}
import { Injectable } from "@nestjs/common";
import { TradingService } from "../trading.service";
import { Cron, Interval } from "@nestjs/schedule";
import { AppConfigService } from "src/config/app-config.service";

@Injectable()
export class GasPriceCacheScheduler {
    private isRunning = false;

    constructor(
        private readonly tradingService: TradingService
    ) { }

    // Checks if it's valid for update every 1000 ms
    @Interval(1000)
    public async checkAndUpdateGasPriceCache() {
        // It works with outgoing requests, so to avoid data-racing conditions
        if (this.isRunning) {
            return;
        }

        try {
            this.isRunning = true;
            await this.tradingService.updateGasPriceCache();
        } catch (ex) {

        } finally {
            this.isRunning = false;
        }
    }
}
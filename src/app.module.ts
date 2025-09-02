import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from './config/app-config.module';
import { AppLoggerModule } from './logger/app-logger.module';
import { TradingModule } from './modules/trading/trading.module';

@Module({
  imports: [
    // System
    AppConfigModule,
    AppLoggerModule,

    // Business
    TradingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

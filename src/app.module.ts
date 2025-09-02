import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AppConfigModule } from './config/app-config.module';
import { AppLoggerModule } from './logger/app-logger.module';
import { TradingModule } from './modules/trading/trading.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // System
    AppConfigModule,
    AppLoggerModule,
    ScheduleModule.forRoot(),

    // Business
    TradingModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

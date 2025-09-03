import { DynamicModule, Module, Provider, Type } from "@nestjs/common";
import { EthAdapterService, IEthAdapterServiceConfig } from "./eth-adapter.service";
import { AppLoggerModule } from "src/logger/app-logger.module";

// Application-wide approach for dynamic external adapters

export interface EthAdapterModuleAsyncOptions {
    imports?: any[];
    useFactory: (...args: any[]) => IEthAdapterServiceConfig | Promise<IEthAdapterServiceConfig>;
    inject?: Array<Type<any> | string | symbol>;
}

@Module({})
export class EthAdapterModule {
    static registerAsync(options: EthAdapterModuleAsyncOptions): DynamicModule {
        const configProvider: Provider = {
            provide: "ETH_ADAPTER_CONFIG",
            useFactory: options.useFactory,
            inject: options.inject ?? [],
        };

        return {
            module: EthAdapterModule,
            imports: [
                ...(options.imports || []),
                AppLoggerModule,
            ],
            providers: [
                configProvider,
                EthAdapterService,
            ],
            exports: [EthAdapterService],
        };
    }
}
import { DynamicModule, Module, Provider, Type } from "@nestjs/common";
import { EthAdapterService } from "./eth-adapter.service";

// Application-wide approach for dynamic external adapters

export interface IEthAdapterConfig {
    ethRpcUri: string;
    uniswapV2FactoryAddress: string;
}

export interface EthAdapterModuleAsyncOptions {
    imports?: any[];
    useFactory: (...args: any[]) => IEthAdapterConfig | Promise<IEthAdapterConfig>;
    inject?: Array<Type<any> | string | symbol>;
}

@Module({})
export class EthAdapterModule {
    static registerAsync(options: EthAdapterModuleAsyncOptions): DynamicModule {
        return {
            module: EthAdapterModule,
            imports: options.imports || [],
            providers: [
                {
                    provide: EthAdapterService,
                    useFactory: async (...args: any[]) => {
                        const config = await options.useFactory(...args);
                        return new EthAdapterService(config.ethRpcUri, config.uniswapV2FactoryAddress);
                    },
                    inject: options.inject ?? [],
                },
            ],
            exports: [EthAdapterService],
        };
    }
}
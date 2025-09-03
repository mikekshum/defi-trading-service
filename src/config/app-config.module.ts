import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { appConfigValidationSchema } from "./app-config.validation-schema";
import { AppConfigService } from "./app-config.service";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ".env",
            validationSchema: appConfigValidationSchema,
        })
    ],
    providers: [
        AppConfigService
    ],
    exports: [
        AppConfigService
    ]
})
export class AppConfigModule { }
import { Controller, Get, Param, Post } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TradingService } from "./trading.service";
import { GasPriceResponseDTO } from "./dto/gas-price-response.dto";
import { TokenReturnResponseDTO } from "./dto/token-return-response.dto";
import { TokenReturnRequestDTO } from "./dto/token-return-request.dto";
import { HttpErrorResponseDTO } from "../../common/dto/http-exception-response.dto";

// Empty base path so that the code follows the project spec
@Controller()
@ApiTags("Trading")
export class TradingController {
    constructor(
        private readonly tradingService: TradingService
    ) { }

    @Get("/gasPrice")
    @ApiOperation({ summary: "Get last cached gas price in wei" })
    @ApiResponse({ status: 200, type: GasPriceResponseDTO })
    @ApiResponse({ status: 500, type: HttpErrorResponseDTO })
    async getGasPrice(): Promise<GasPriceResponseDTO> {
        const gasPrice = await this.tradingService.getGasPrice();

        return {
            wei: gasPrice.value,
            timestamp: gasPrice.timestamp.getTime()
        };
    }

    @Get("/return/:fromTokenAddress/:toTokenAddress/:amountIn")
    @ApiOperation({ summary: "Get estimated toToken amountOut" })
    @ApiResponse({ status: 200, type: TokenReturnResponseDTO })
    @ApiResponse({ status: 500, type: HttpErrorResponseDTO })
    @ApiResponse({ status: 400, type: HttpErrorResponseDTO })
    async getTokenReturn(@Param() dto: TokenReturnRequestDTO): Promise<TokenReturnResponseDTO> {
        const amountOut = await this.tradingService.getTokenReturn(
            dto.fromTokenAddress,
            dto.toTokenAddress,
            dto.amountIn,
        );

        return { amountOut };
    }
}
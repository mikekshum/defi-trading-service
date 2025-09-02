import { HttpExceptionStatus } from "src/common/decorators/http-exception-status.decorator";
import { ServiceExceptionCode } from "src/common/exceptions/service-exception-code.enum";
import { BaseServiceException } from "src/common/exceptions/base-service.exception";

@HttpExceptionStatus(500)
export class TradingGasPriceFetchException extends BaseServiceException {
    constructor(message?: string, details?: Record<string, any>) {
        super(ServiceExceptionCode.TRADING_GAS_PRICE_FETCH_FAILED, message, details);
    }
}
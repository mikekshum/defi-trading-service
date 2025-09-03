import { HttpExceptionStatus } from "../../../common/decorators/http-exception-status.decorator";
import { ServiceExceptionCode } from "../../../common/exceptions/service-exception-code.enum";
import { BaseServiceException } from "../../../common/exceptions/base-service.exception";

@HttpExceptionStatus(500)
export class TradingEthAdapterFailedException extends BaseServiceException {
    constructor(message?: string, details?: Record<string, any>) {
        super(ServiceExceptionCode.TRADING_ETH_ADAPTER_FAILED, message, details);
    }
}
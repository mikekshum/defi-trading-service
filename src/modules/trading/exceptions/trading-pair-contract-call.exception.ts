
import { HttpExceptionStatus } from "src/common/decorators/http-exception-status.decorator";
import { BaseServiceException } from "src/common/exceptions/base-service.exception";
import { ServiceExceptionCode } from "src/common/exceptions/service-exception-code.enum";

@HttpExceptionStatus(500)
export class TradingPairContractCallException extends BaseServiceException {
    constructor(message?: string, details?: Record<string, any>) {
        super(ServiceExceptionCode.TRADING_PAIR_CONTRACT_CALL_FAILED, message, details);
    }
}
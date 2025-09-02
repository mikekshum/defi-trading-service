import { HttpExceptionStatus } from "../decorators/http-exception-status.decorator";
import { BaseServiceException } from "./base-service.exception";
import { ServiceExceptionCode } from "./service-exception-code.enum";

@HttpExceptionStatus(500)
export class InternalErrorException extends BaseServiceException {
    constructor(message?: string, details?: Record<string, any>) {
        super(ServiceExceptionCode.BASE_INTERNAL_ERROR, message, details);
    }
}
import { HttpExceptionStatus } from "../decorators/http-exception-status.decorator";
import { ServiceExceptionCode } from "./service-exception-code.enum";
import { BaseServiceException } from "./base-service.exception";

@HttpExceptionStatus(400)
export class InternalErrorException extends BaseServiceException {
    constructor(message?: string, details?: Record<string, any>) {
        super(ServiceExceptionCode.BASE_VALIDATION_ERROR, message, details);
    }
}
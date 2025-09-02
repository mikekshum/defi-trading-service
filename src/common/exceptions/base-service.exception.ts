import { ServiceExceptionCode } from "./service-exception-code.enum";

// Service-level exception, describes exceptions thrown from services
export abstract class BaseServiceException extends Error {
    public readonly code: ServiceExceptionCode;
    public readonly details?: Record<string, any>;

    constructor(code: ServiceExceptionCode, message?: string, details?: Record<string, any>) {
        super(message);
        this.code = code;
        this.details = details;

        // Error name equals to class name for tracing
        this.name = this.constructor.name;
    }
}
import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { HttpErrorResponseDTO } from "../dto/http-exception-response.dto";
import { ServiceExceptionCode } from "../exceptions/service-exception-code.enum";
import { BaseServiceException } from "../exceptions/base-service.exception";
import { Request, Response } from "express";

// Unifies every possible system exception into the transport level format, used in main.ts
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();
        const req = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let code = ServiceExceptionCode.BASE_INTERNAL_ERROR;
        let message = "Internal server error";
        let details: any = undefined;

        // Service-level exceptions handling
        if (exception instanceof BaseServiceException) {
            status =
                Reflect.getMetadata("httpStatus", exception.constructor) ||
                HttpStatus.INTERNAL_SERVER_ERROR;
            code = exception.code;
            message = exception.message || message;
        }

        // Validation exceptions handling
        if (exception instanceof BadRequestException) {
            const response = exception.getResponse() as any;
            status = HttpStatus.BAD_REQUEST;
            code = ServiceExceptionCode.BASE_VALIDATION_ERROR;

            if (Array.isArray(response.message)) {
                message = "Validation failed";
                details = response.message.map((err: any) => ({ message: err }));
            } else {
                message = response.message || message;
                details = response;
            }
        }

        if (exception instanceof NotFoundException) {
            status = HttpStatus.NOT_FOUND;
            message = exception.message || message;
            code = ServiceExceptionCode.BASE_NOT_FOUND;
            details = null;
        }

        // Any runtime errors handling
        if (exception instanceof Error) {
            message = exception.message || message;
        }

        // Unified http response
        const payload = new HttpErrorResponseDTO(
            status,
            code,
            message,
            new Date().getTime(),
            req.url,
            req.method,
            details
        );

        res.status(status).json(payload);
    }
}
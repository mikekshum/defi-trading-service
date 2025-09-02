import { HttpException } from "@nestjs/common";
import { ApiProperty } from "@nestjs/swagger";
import { ServiceExceptionCode } from "../exceptions/service-exception-code.enum";
import { IsNumber } from "class-validator";

// Unified http transport level response, used in documentation and filters
export class HttpErrorResponseDTO {
    @ApiProperty({
        description: 'HTTP status code',
        example: 400
    })
    public readonly status: number;

    @ApiProperty({
        description: 'Unique service-level exception code',
        enum: ServiceExceptionCode,
        example: ServiceExceptionCode.BASE_INTERNAL_ERROR
    })
    public readonly code: ServiceExceptionCode;

    @ApiProperty({
        description: 'Error message',
        example: 'Validation failed'
    })
    public readonly message: string;

    @ApiProperty({
        description: 'Timestamp in milliseconds since midnight, January 1, 1970 UTC',
        example: '101988993'
    })
    public readonly timestamp: number;

    @ApiProperty({
        description: 'Request path string',
        example: '/path/to/method'
    })
    public readonly path: string;

    @ApiProperty({
        description: 'Request http method',
        example: 'GET'
    })
    public readonly method: string;

    @ApiProperty({
        description: 'Optional details object or array',
        required: false,
        example: [{ field: 'amount', message: 'Must be positive' }]
    })
    public readonly details?: any;

    constructor(
        status: number,
        code: ServiceExceptionCode,
        message: string,
        timestamp: number,
        path: string,
        method: string,
        details?: any
    ) {
        this.status = status;
        this.code = code;
        this.message = message;
        this.timestamp = timestamp;
        this.path = path;
        this.method = method;
        this.details = details;
    }
}
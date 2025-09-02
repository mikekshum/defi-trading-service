import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsNumber, IsString } from "class-validator";

export class GasPriceResponseDTO {
    @ApiProperty({
        description: 'Returns last cached gas price in wei',
        example: '1000000000'
    })
    public readonly wei: string;

    @ApiProperty({
        description: 'Timestamp in milliseconds since midnight, January 1, 1970 UTC',
        example: 393848494900
    })
    public readonly timestamp: number;
}
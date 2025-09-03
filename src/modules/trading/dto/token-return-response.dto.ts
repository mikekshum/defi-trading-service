import { ApiProperty } from "@nestjs/swagger";

export class TokenReturnResponseDTO {
    @ApiProperty({
        description: "Estimated amount of tokenTo to be returned from the trade tokenFrom -> tokenTo. In smallest token unit",
        example: "150"
    })
    public readonly amountOut: string;
}
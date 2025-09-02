import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsEthereumAddress, IsNumberString, IsString, Matches } from "class-validator";
import { ETH_CONTRACT_PATTERN } from "src/common/regex";

export class TokenReturnRequestDTO {
    @IsDefined()
    @IsString()
    @Matches(ETH_CONTRACT_PATTERN)
    @ApiProperty({
        pattern: String(ETH_CONTRACT_PATTERN),
        description: 'Smart contract address of the FROM token',
        example: '0x66a0f676479Cee1d7373f3DC2e2952778BfF5bd6'
    })
    public readonly fromTokenAddress: string;

    @IsDefined()
    @IsString()
    @Matches(ETH_CONTRACT_PATTERN)
    @ApiProperty({
        pattern: String(ETH_CONTRACT_PATTERN),
        description: 'Smart contract address of the TO token',
        example: '0x66a0f676479Cee1d7373f3DC2e2952778BfF5bd6'
    })
    public readonly toTokenAddress: string;

    @IsDefined()
    @IsNumberString()
    @ApiProperty({
        description: 'Amount or FROM token user is giving in. In smallest token unit'
    })
    public readonly amountIn: string;
}
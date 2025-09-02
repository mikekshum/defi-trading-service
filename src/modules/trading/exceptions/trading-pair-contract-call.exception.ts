import { TradingExceptionCode } from "./trading-exception-code.enum";

export class TradingPairContractCallException extends Error {
    public code = TradingExceptionCode.PAIR_CONTRACT_CALL_FAILED;

    constructor(message: string) {
        super(message);
    }
}
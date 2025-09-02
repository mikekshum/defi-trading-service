import { TradingExceptionCode } from "./trading-exception-code.enum";

export class TradingFactoryContractCallException extends Error {
    public code = TradingExceptionCode.FACTORY_CONTRACT_CALL_FAILED;

    constructor(message: string) {
        super(message);
    }
}
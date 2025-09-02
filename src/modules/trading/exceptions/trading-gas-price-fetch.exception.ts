import { TradingExceptionCode } from "./trading-exception-code.enum";

export class TradingGasPriceFetchException extends Error {
    public code = TradingExceptionCode.GAS_PRICE_FETCH_FAILED;

    constructor(message: string) {
        super(message);
    }
}
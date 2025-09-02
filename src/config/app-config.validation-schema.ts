import Joi from "joi";
import { ETH_CONTRACT_PATTERN } from "./validators";

// Validation schema for .env file. Used in AppConfigModule
export const appConfigValidationSchema = Joi.object({
    // APP
    APP_PORT: Joi.number().required(),

    // ETH RPC provider
    ETH_RPC_URI: Joi.string().uri().required(),

    GAS_PRICE_CACHE_TTL_MS: Joi.number().required(),

    // Uniswap v2
    UNISWAP_V2_FACTORY_ADDRESS: Joi.string().pattern(ETH_CONTRACT_PATTERN).required(),
    UNISWAP_v2_TRADING_FEE: Joi.number().required()
});
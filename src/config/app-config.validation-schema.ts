import Joi from "joi";
import { ETH_CONTRACT_PATTERN } from "src/common/regex";

// Validation schema for .env file. Used in AppConfigModule
export const appConfigValidationSchema = Joi.object({
    // APP
    APP_PORT: Joi.number().required(),

    // ETH RPC provider (Alchemy)
    ETH_RPC_API_KEY: Joi.string().required(),
    ETH_RPC_CHAIN_ID: Joi.number().integer().required(),

    GAS_PRICE_CACHE_TTL_MS: Joi.number().required(),

    // Uniswap v2
    UNISWAP_V2_FACTORY_ADDRESS: Joi.string().pattern(ETH_CONTRACT_PATTERN).required(),
    // UNISWAP_v2_TRADING_FEE: Joi.number().required()
});
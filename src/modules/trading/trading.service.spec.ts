import { Test, TestingModule } from "@nestjs/testing";
import { TradingService } from "./trading.service";
import { AppConfigService } from "../../config/app-config.service";
import { AppLoggerService } from "../../logger/app-logger.service";
import { calculateUniswapV2Return } from "../../common/utils";
import { ethers } from "ethers";
import { EthAdapterService } from "../../adapters/eth/eth-adapter.service";
import { TradingEthAdapterFailedException } from "./exceptions/trading-eth-adapter-failed.exception";
import { EthAdapterFactoryContractCallException } from "../../adapters/eth/exceptions/eth-adapter-factory-contract-call.exception";
import { EthAdapterGasPriceFetchException } from "../../adapters/eth/exceptions/eth-adapter-gas-price-fetch.exception";

const mockConfigService = {
    ethRpcUri: "https://ethrpc.com",
    uniswapV2FactoryAddress: "valid-factory-address",
    gasPriceCacheTTLMs: 3000,
};

const mockLoggerService = {
    setContext: jest.fn(),
    debug: jest.fn(),
    log: jest.fn(),
    error: jest.fn(),
};

const mockEthAdapterService: Partial<jest.Mocked<EthAdapterService>> = {
    getFeeData: jest.fn(),
    getUniswapV2PairContractMetadata: jest.fn(),
    getUniswapV2PairContractAddress: jest.fn()
};

describe("TradingService", () => {
    let service: TradingService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TradingService,
                { provide: AppConfigService, useValue: mockConfigService },
                { provide: AppLoggerService, useValue: mockLoggerService },
                { provide: EthAdapterService, useValue: mockEthAdapterService },
            ],
        }).compile();

        service = module.get<TradingService>(TradingService);
        service["provider"] = new ethers.JsonRpcProvider(); // Already mocked
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("getGasPrice", () => {
        it("should return cached gas price", async () => {
            mockEthAdapterService.getFeeData!.mockResolvedValue({
                gasPrice: 1000000n,
                maxPriorityFeePerGas: null,
                maxFeePerGas: null
            });

            await service.updateGasPriceCache();

            const gasLast = await service.getGasPrice();
            const gasNow = await service.getGasPrice();
            expect(gasLast.value).toBe(gasNow.value);
            expect(gasLast.timestamp).toBe(gasNow.timestamp);
        });

        it("should fetch new gas price if cache is null", async () => {
            mockEthAdapterService.getFeeData!.mockResolvedValue({
                gasPrice: 1000005n,
                maxPriorityFeePerGas: null,
                maxFeePerGas: null
            });

            service["gasPriceCache"] = null;
            const gas = await service.getGasPrice();
            expect(gas.value).toBe("1000005");
        });

        it("should throw TradingEthAdapterException on RPC failure", async () => {
            mockEthAdapterService.getFeeData!.mockRejectedValue(new EthAdapterGasPriceFetchException("RPC fail"));
            service["gasPriceCache"] = null;

            await expect(service.updateGasPriceCache()).rejects.toThrow(TradingEthAdapterFailedException);
        });
    });

    describe("getTokenReturn", () => {
        it("should return correct token amount", async () => {
            mockEthAdapterService.getUniswapV2PairContractAddress!.mockResolvedValue("pair-contract-address");

            mockEthAdapterService.getUniswapV2PairContractMetadata!.mockResolvedValue({
                token0: "token-to",
                reserve0: 1000n,
                reserve1: 2000n
            });

            const amountOut = await service.getTokenReturn("token-to", "token-from", "100");
            const expected = calculateUniswapV2Return(100n, 1000n, 2000n).toString();
            expect(amountOut).toBe(expected);
        });

        it("should map reserves to token0; token0: token-from", async () => {
            mockEthAdapterService.getUniswapV2PairContractAddress!.mockResolvedValue("pair-contract-address");

            mockEthAdapterService.getUniswapV2PairContractMetadata!.mockResolvedValue({
                token0: "token-from",
                reserve0: 1000n,
                reserve1: 2000n
            });

            const amountOut = await service.getTokenReturn("token-from", "token-to", "100");
            const expected = calculateUniswapV2Return(100n, 1000n, 2000n).toString();
            expect(amountOut).toBe(expected);
        });

        it("should map reserves to token0; token0: token-to", async () => {
            mockEthAdapterService.getUniswapV2PairContractAddress!.mockResolvedValue("pair-contract-address");

            mockEthAdapterService.getUniswapV2PairContractMetadata!.mockResolvedValue({
                token0: "token-to",
                reserve0: 2000n,
                reserve1: 1000n
            });

            const amountOut = await service.getTokenReturn("token-from", "token-to", "100");
            const expected = calculateUniswapV2Return(100n, 1000n, 2000n).toString();
            expect(amountOut).toBe(expected);
        });
    });

    describe("updateGasPriceCache", () => {
        it("should update gasPriceCache", async () => {
            mockEthAdapterService.getFeeData!.mockResolvedValue({
                gasPrice: 190n,
                maxPriorityFeePerGas: null,
                maxFeePerGas: null
            });

            await service.updateGasPriceCache();
            expect(service["gasPriceCache"]).toBeDefined();
            expect(service["gasPriceCache"]!.value).toBe("190");
        });

        it("should not update cache if TTL not expired", async () => {
            mockEthAdapterService.getFeeData!.mockResolvedValue({
                gasPrice: 195n,
                maxPriorityFeePerGas: null,
                maxFeePerGas: null
            });

            await service.updateGasPriceCache();
            const oldCache = service["gasPriceCache"];
            await service.updateGasPriceCache();
            expect(service["gasPriceCache"]).toBe(oldCache);
        });
    });
});
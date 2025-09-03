import { Test, TestingModule } from "@nestjs/testing";
import { TradingController } from "./trading.controller";
import { TradingService } from "./trading.service";
import { GasPriceResponseDTO } from "./dto/gas-price-response.dto";
import { TradingEthAdapterFailedException } from "./exceptions/trading-eth-adapter-failed.exception";
import { TokenReturnRequestDTO } from "./dto/token-return-request.dto";
import { TokenReturnResponseDTO } from "./dto/token-return-response.dto";

const mockTradingService: Partial<jest.Mocked<TradingService>> = {
    getGasPrice: jest.fn(),
    getTokenReturn: jest.fn(),
};

describe('TradingController', () => {
    let controller: TradingController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TradingController],
            providers: [
                { provide: TradingService, useValue: mockTradingService },
            ],
        }).compile();

        controller = module.get<TradingController>(TradingController);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getGasPrice', () => {
        it('should return mapped DTO', async () => {
            const now = new Date();
            mockTradingService.getGasPrice!.mockResolvedValue({
                value: '123456',
                timestamp: now,
            });

            const result: GasPriceResponseDTO = await controller.getGasPrice();

            expect(result).toEqual({
                wei: '123456',
                timestamp: now.getTime(),
            });
            expect(mockTradingService.getGasPrice).toHaveBeenCalledTimes(1);
        });

        it('should propagate service error', async () => {
            mockTradingService.getGasPrice!.mockRejectedValue(
                new TradingEthAdapterFailedException('fail'),
            );

            await expect(controller.getGasPrice()).rejects.toThrow(
                TradingEthAdapterFailedException,
            );
        });
    });

    describe('getTokenReturn', () => {
        it('should return mapped DTO', async () => {
            const dto: TokenReturnRequestDTO = {
                fromTokenAddress: 'tokenFrom',
                toTokenAddress: 'tokenTo',
                amountIn: '100',
            };

            mockTradingService.getTokenReturn!.mockResolvedValue('200');

            const result: TokenReturnResponseDTO = await controller.getTokenReturn(dto);

            expect(result).toEqual({ amountOut: '200' });
            expect(mockTradingService.getTokenReturn).toHaveBeenCalledWith(
                'tokenFrom',
                'tokenTo',
                '100',
            );
        });

        it('should propagate service errors', async () => {
            mockTradingService.getTokenReturn!.mockRejectedValue(
                new TradingEthAdapterFailedException('pair fail'),
            );

            const dto: TokenReturnRequestDTO = {
                fromTokenAddress: 'tokenFrom',
                toTokenAddress: 'tokenTo',
                amountIn: '100',
            };

            await expect(controller.getTokenReturn(dto)).rejects.toThrow(
                TradingEthAdapterFailedException,
            );
        });
    });
});
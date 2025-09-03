import { calculateUniswapV2Return } from "./uniswap-v2.util";

describe("Uniswap V2 Utilities", () => {
    describe("calculateUniswapV2Return", () => {
        it("should calculate correct output for simple reserves", () => {
            // Formula: amountOut = (amountIn * 997 * reserveOut) / (reserveIn * 1000 + amountIn * 997)
            const amountIn = 1000n;
            const reserveIn = 5000n;
            const reserveOut = 10000n;

            const expected = (amountIn * 997n * reserveOut) / (reserveIn * 1000n + amountIn * 997n);
            const result = calculateUniswapV2Return(amountIn, reserveIn, reserveOut);

            expect(result).toBe(expected);
        });

        it("should return 0 when input amount is 0", () => {
            const result = calculateUniswapV2Return(0n, 1000n, 1000n);
            expect(result).toBe(0n);
        });

        it("should match expected swap output for tiny amounts", () => {
            const amountIn = 1n;
            const reserveIn = 1000n;
            const reserveOut = 2000n;

            const expected = (amountIn * 997n * reserveOut) / (reserveIn * 1000n + amountIn * 997n);
            const result = calculateUniswapV2Return(amountIn, reserveIn, reserveOut);

            expect(result).toBe(expected);
        });

        it("should handle large input amounts", () => {
            const amountIn = 1_000_000_000_000_000_000n;
            const reserveIn = 1_000_000_000_000n;
            const reserveOut = 2_000_000_000_000n;

            const expected = (amountIn * 997n * reserveOut) / (reserveIn * 1000n + amountIn * 997n);
            const result = calculateUniswapV2Return(amountIn, reserveIn, reserveOut);

            expect(result).toBe(expected);
        });
    });
});
// Calculates return of a Uniswap V2 pair trade with 0.3% fee
// More info: https://github.com/Uniswap/v2-periphery/blob/master/contracts/libraries/UniswapV2Library.sol
// And: https://rareskills.io/post/uniswap-v2-price-impact
export const calculateUniswapV2Return = (
    amountIn: bigint,
    reserveIn: bigint,
    reserveOut: bigint
): bigint => {
    if (amountIn <= 0n) {
        return 0n;
    }
    if (reserveIn <= 0n || reserveOut <= 0n) {
        return 0n;
    }

    const amountInWithFee = amountIn * 997n;
    const numerator = amountInWithFee * reserveOut;
    const denominator = reserveIn * 1000n + amountInWithFee;

    return numerator / denominator;
};
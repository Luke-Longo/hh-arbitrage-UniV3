// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3FlashCallback.sol";
import "@uniswap/v3-core/contracts/libraries/LowGasSafeMath.sol";

import "@uniswap/v3-periphery/contracts/base/PeripheryPayments.sol";
import "@uniswap/v3-periphery/contracts/base/PeripheryImmutableState.sol";
import "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol";
import "@uniswap/v3-periphery/contracts/libraries/CallbackValidation.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";

/// @title Flash contract implementation
/// @notice An example contract using the Uniswap V3 flash function
contract PairFlash is IUniswapV3FlashCallback, PeripheryImmutableState, PeripheryPayments {
    using LowGasSafeMath for uint256;
    using LowGasSafeMath for int256;

    ISwapRouter public immutable i_swapRouter;
    address private immutable i_owner;

    event Flash(
        address token0,
        address token1,
        uint256 fee1,
        uint256 amount0,
        uint256 amount1,
        uint256 fee2,
        uint256 fee3
    );

    event Withdraw(address indexed sender, uint256 amount);

    constructor(
        ISwapRouter _swapRouter,
        address _factory,
        address _WETH9
    ) PeripheryImmutableState(_factory, _WETH9) {
        i_swapRouter = _swapRouter;
        i_owner = msg.sender;
    }

    modifier _ownerOnly() {
        if (msg.sender != i_owner) revert("Not owner");
        _;
    }

    /// @param fee0 The fee from calling flash for token0
    /// @param fee1 The fee from calling flash for token1
    /// @param data The data needed in the callback passed as FlashCallbackData from `initFlash`
    /// @notice implements the callback called from flash
    /// @dev fails if the flash is not profitable, meaning the amountOut from the flash is less than the amount borrowed
    function uniswapV3FlashCallback(
        uint256 fee0,
        uint256 fee1,
        bytes calldata data
    ) external override {
        // flashbot uncle check
        // require(blockhash(block.number - 1) == expectedParentHash, "block was uncled");
        // FlashCallbackData is defined in the PairFlash contract {
        // uint256 amount0;
        // uint256 amount1;
        // address payer;
        // PoolAddress.PoolKey poolKey;
        // uint24 poolFee2;
        // uint24 poolFee3;
        // }
        // so you get the amount 0 and amout 1 that you are wishing to flash swap with the address of the payer and the pool key (token0, token1, fee) and the pool fees for each of the tokens based on the addresses input into the initFlash function
        // setting the decoded data to a variable
        FlashCallbackData memory decoded = abi.decode(data, (FlashCallbackData));
        // verifys that the callback is from the correct pool
        CallbackValidation.verifyCallback(factory, decoded.poolKey);

        // the token addresses you are looking to swap
        address token0 = decoded.poolKey.token0;
        address token1 = decoded.poolKey.token1;

        // look into the transfer helper to see how this works
        // approves the amount of token0 and token1 so that the router can call transfer on the token contracts and send the tokens back to the router, allows for the swap from SwapRouter
        TransferHelper.safeApprove(token0, address(i_swapRouter), decoded.amount0);
        TransferHelper.safeApprove(token1, address(i_swapRouter), decoded.amount1);

        // profitable check
        // exactInputSingle will fail if this amount not met
        // the fees are input params from the uniswap pool calling the callback function
        // these are the minimum amounts of token0 and token1 that you can recieve on the swaps or else the execution will fail
        uint256 amount0Min = LowGasSafeMath.add(decoded.amount0, fee0);
        uint256 amount1Min = LowGasSafeMath.add(decoded.amount1, fee1);

        // below you do not need to pull a loan on both the tokens you can pick whichever token you want to pull the loan on and then swap the other token for the token you pulled the loan on

        // // calculte the deadline for each transaction

        // below you will want to run deiffernt swaps using the flash loan proided tokens,
        // call exactInputSingle for swapping token1 (input) for token0 (output) in pool w/fee2
        // this will fail if the amout out is below the desired min amount out
        uint256 amountOut0 = i_swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: token1,
                tokenOut: token0,
                fee: decoded.poolFee2,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: decoded.amount1,
                amountOutMinimum: amount0Min,
                sqrtPriceLimitX96: 0
            })
        );

        // call exactInputSingle for swapping token0 for token 1 in pool w/fee3
        uint256 amountOut1 = i_swapRouter.exactInputSingle(
            ISwapRouter.ExactInputSingleParams({
                tokenIn: token0,
                tokenOut: token1,
                fee: decoded.poolFee3,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: decoded.amount0,
                amountOutMinimum: amount1Min,
                sqrtPriceLimitX96: 0
            })
        );

        // end up with amountOut0 of token0 from first swap and amountOut1 of token1 from second swap
        // these are also the values of the amount0Min and amount1Min
        uint256 amount0Owed = LowGasSafeMath.add(decoded.amount0, fee0);
        uint256 amount1Owed = LowGasSafeMath.add(decoded.amount1, fee1);

        // allows for the transfer of the owed tokens to this contract
        TransferHelper.safeApprove(token0, address(this), amount0Owed);
        TransferHelper.safeApprove(token1, address(this), amount1Owed);

        // repay the flash loan
        // this will pay the amount owed to the pool that called the callback function if the amoutn owed is greater than 0, ie if you took out a loan on the token
        if (amount0Owed > 0) pay(token0, address(this), msg.sender, amount0Owed);
        if (amount1Owed > 0) pay(token1, address(this), msg.sender, amount1Owed);

        // if profitable pay profits to payer
        if (amountOut0 > amount0Owed) {
            uint256 profit0 = LowGasSafeMath.sub(amountOut0, amount0Owed);
            TransferHelper.safeApprove(token0, address(this), profit0);
            pay(token0, address(this), decoded.payer, profit0);
        }
        if (amountOut1 > amount1Owed) {
            uint256 profit1 = LowGasSafeMath.sub(amountOut1, amount1Owed);
            TransferHelper.safeApprove(token0, address(this), profit1);
            pay(token1, address(this), decoded.payer, profit1);
        }
    }

    //fee1 is the fee of the pool from the initial borrow, basically the identifier for the pool
    //fee2 is the fee of the first pool to arb from
    //fee3 is the fee of the second pool to arb from
    struct FlashParams {
        address token0;
        address token1;
        uint24 fee1;
        uint256 amount0;
        uint256 amount1;
        uint24 fee2;
        uint24 fee3;
    }
    // fee2 and fee3 are the two other fees associated with the two other pools of token0 and token1
    struct FlashCallbackData {
        uint256 amount0;
        uint256 amount1;
        address payer;
        PoolAddress.PoolKey poolKey;
        uint24 poolFee2;
        uint24 poolFee3;
    }

    /// @param params The parameters necessary for flash and the callback, passed in as FlashParams
    /// @notice Calls the pools flash function with data needed in `uniswapV3FlashCallback`
    function initFlash(FlashParams memory params) external {
        // set the poolKey to the {token0, token1, and fee1}
        PoolAddress.PoolKey memory poolKey = PoolAddress.PoolKey({
            token0: params.token0,
            token1: params.token1,
            fee: params.fee1
        });
        // defines the pool you are borrowing from based on the parmas passsed to the function
        // factory value comes from the PeripheryImmutableState contract and is the uniswap factory address
        // the pool variable is the uniswap pool contract of the pool you are borrowing from
        IUniswapV3Pool pool = IUniswapV3Pool(PoolAddress.computeAddress(factory, poolKey));
        // defines the data that will be passed to the callback function
        // recipient of borrowed amounts
        // amount of token0 requested to borrow
        // amount of token1 requested to borrow
        // need amount 0 and amount1 in callback to pay back pool
        // recipient of flash should be THIS contract
        pool.flash(
            address(this),
            params.amount0,
            params.amount1,
            abi.encode(
                FlashCallbackData({
                    amount0: params.amount0,
                    amount1: params.amount1,
                    payer: msg.sender,
                    poolKey: poolKey,
                    poolFee2: params.fee2,
                    poolFee3: params.fee3
                })
            )
        );
        emit Flash(
            params.token0,
            params.token1,
            params.fee1,
            params.amount0,
            params.amount1,
            params.fee2,
            params.fee3
        );
    }

    function withdraw() external _ownerOnly {
        payable(msg.sender).transfer(address(this).balance);
        emit Withdraw(msg.sender, address(this).balance);
    }
}

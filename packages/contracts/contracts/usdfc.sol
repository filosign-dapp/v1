// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDFC is ERC20 {
    constructor() ERC20("test USDFC", "tUSDFC") {
        _mint(msg.sender, 100_000_000 * 10 ** decimals());
    }
}

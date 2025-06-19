// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDFC is ERC20 {
    constructor(address admin_) ERC20("test USDFC", "tUSDFC") {
        _mint(admin_, 100_000_000 * 10 ** decimals());
    }
}

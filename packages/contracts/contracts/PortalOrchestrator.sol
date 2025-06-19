// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./KeyManager.sol";
import "./SubHandler.sol";
import "./usdfc.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PortalOrchestrator {
    address private _admin;

    mapping(address => bool) public spenders;

    KeyManager public keyManager;
    SubHandler public subHandler;
    ERC20 public usdfc;

    uint256 public immutable ONE_USDFC;

    event Payment(address indexed user, uint256 amount, string reason);

    constructor() {
        _admin = msg.sender;

        keyManager = new KeyManager();
        spenders[address(keyManager)] = true;

        subHandler = new SubHandler(_admin);
        spenders[address(subHandler)] = true;

        usdfc = ERC20(address(new USDFC(msg.sender)));
        ONE_USDFC = 10 ** usdfc.decimals();
    }

    modifier onlyAdmin() {
        require(msg.sender == _admin, "Not admin");
        _;
    }

    modifier onlySpender() {
        require(spenders[msg.sender], "Not a spender");
        _;
    }

    function setAdmin(address admin_) external {
        _admin = admin_;
    }

    function receivePayment(
        uint256 amount,
        string calldata reason
    ) external onlySpender {
        require(amount > 0, "Amount must be greater than zero");

        usdfc.transferFrom(msg.sender, address(this), amount * ONE_USDFC);

        emit Payment(msg.sender, amount, reason);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SubHandler is Ownable {
    struct Plan {
        string name;
        uint256 price;
    }

    mapping(uint8 => Plan) public plans;
    mapping(address => string) public userPlans;

    constructor(address admin) Ownable(admin) {}

    function buyPlan(uint8 planId) external {
        require(plans[planId].price > 0, "Invalid plan");
        require(msg.value == plans[planId].price, "Incorrect payment");

        userPlans[msg.sender] = plans[planId].name;
        console.log("Plan purchased:", plans[planId].name);
    }
}

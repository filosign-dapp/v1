// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./PortalOrchestrator.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SubHandler is Ownable {
    struct Plan {
        string name;
        uint256 price;
    }

    mapping(uint8 => Plan) public plans;
    mapping(address => uint8) public userPlans;
    mapping(address => uint256) public userPlanExpiries;

    PortalOrchestrator private _orchestrator;

    constructor(address admin) Ownable(admin) {
        _orchestrator = PortalOrchestrator(msg.sender);
    }

    modifier onlyRegistered() {
        require(
            _orchestrator.iam().registered(msg.sender),
            "User not registered"
        );
        _;
    }

    function setPlan(
        uint8 planId,
        string calldata name,
        uint256 price
    ) external onlyOwner {
        require(planId > 0, "Invalid plan ID");
        require(price > 0, "Price must be greater than zero");

        plans[planId] = Plan(name, price);
    }

    function buyPlan(uint8 planId) external payable onlyRegistered {
        require(
            userPlanExpiries[msg.sender] <= block.timestamp,
            "User already has a plan"
        );
        require(plans[planId].price > 0, "Invalid plan");
        require(msg.value == plans[planId].price, "Incorrect payment");

        userPlans[msg.sender] = planId;
    }

    function getActivePlan(address user) external view returns (uint8) {
        uint8 planId = userPlans[user];
        require(planId > 0, "User has no active plan");

        return planId;
    }

    function getPlanExpiry(address user) external view returns (uint256) {
        uint8 planId = userPlans[user];
        require(planId > 0, "User has no active plan");

        return userPlanExpiries[user];
    }
}

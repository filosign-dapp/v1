// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./PortalOrchestrator.sol";

contract KeyManager {
    struct Key {
        address uploader;
        address owner;
        uint256 timestamp;
        mapping(address => bytes) seeds;
    }

    PortalOrchestrator private _orchestrator;

    mapping(string => Key) public uploads;

    constructor() {
        _orchestrator = PortalOrchestrator(msg.sender);
    }

    function registerUpload(
        string calldata cid_,
        address[] memory for_,
        bytes[] memory values_
    ) external {
        require(uploads[cid_].timestamp == 0, "Already registered");
        require(bytes(cid_).length > 0, "CID cannot be empty");
        require(
            _orchestrator.iam().registered(msg.sender),
            "User not registered"
        );

        mapping(address => bytes) storage seeds = uploads[cid_].seeds;

        uploads[cid_].uploader = _orchestrator.iam().resolvePublicKeyAddress(
            msg.sender
        );
        uploads[cid_].owner = msg.sender;
        uploads[cid_].timestamp = block.timestamp;

        for (uint256 i = 0; i < for_.length; i++) {
            require(
                _orchestrator.iam().registered(for_[i]),
                "Recipient not registered"
            );
            seeds[for_[i]] = values_[i];
        }
    }

    function getKeySeed(
        string calldata cid_,
        address for_
    ) external view returns (bytes memory) {
        require(uploads[cid_].timestamp != 0, "Not registered");
        return uploads[cid_].seeds[for_];
    }
}

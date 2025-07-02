// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./PortalOrchestrator.sol";

contract KeyManager {
    struct Key {
        address uploader;
        address owner;
        uint256 timestamp;
        mapping(address => bytes) seeds;
        mapping(address => bool) paid;
        uint256 expiration;
        uint256 cost;
        bool irrevocable;
    }

    PortalOrchestrator private _orchestrator;

    mapping(string => Key) private uploads;

    constructor() {
        _orchestrator = PortalOrchestrator(msg.sender);
    }

    function getUploader(string calldata cid_) external view returns (address) {
        require(uploads[cid_].timestamp != 0, "File not exist");
        return uploads[cid_].uploader;
    }

    function getOwner(string calldata cid_) external view returns (address) {
        require(uploads[cid_].timestamp != 0, "File not exist");
        return uploads[cid_].owner;
    }

    function makeIrrevocable(string calldata cid_) external {
        require(uploads[cid_].timestamp != 0, "File not exist");
        require(
            msg.sender == uploads[cid_].owner,
            "Only owner can make irrevocable"
        );
        require(!uploads[cid_].irrevocable, "Already irrevocable");

        uploads[cid_].irrevocable = true;
    }

    function isIrrevocable(string calldata cid_) external view returns (bool) {
        require(uploads[cid_].timestamp != 0, "File not exist");
        return uploads[cid_].irrevocable;
    }

    function registerUpload(
        string calldata cid_,
        address[] memory for_,
        bytes[] memory values_,
        uint256 expiration_,
        uint256 cost_
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
        uploads[cid_].expiration = expiration_;
        uploads[cid_].cost = cost_;

        for (uint256 i = 0; i < for_.length; i++) {
            require(
                _orchestrator.iam().registered(for_[i]),
                "Recipient not registered"
            );
            seeds[for_[i]] = values_[i];
        }
    }

    function revoke(string calldata cid_, address for_) external {
        require(uploads[cid_].timestamp != 0, "File not exist");
        require(
            uploads[cid_].seeds[for_].length != 0,
            "No key registered for this address"
        );
        require(msg.sender == uploads[cid_].owner, "Only owner can revoke");
        require(!uploads[cid_].irrevocable, "Cannot revoke an irrevocable key");

        delete uploads[cid_].seeds[for_];
    }

    function getKeySeed(
        string calldata cid_,
        address for_
    ) external view returns (bytes memory) {
        require(uploads[cid_].timestamp != 0, "File not exist");
        require(
            uploads[cid_].seeds[for_].length != 0,
            "No key registered for this address"
        );
        require(
            uploads[cid_].paid[for_] ||
                msg.sender == uploads[cid_].owner ||
                uploads[cid_].cost == 0,
            "Key not paid for"
        );
        require(
            uploads[cid_].expiration <=
                block.timestamp - uploads[cid_].timestamp ||
                uploads[cid_].expiration == 0,
            "Key has expired"
        );

        return uploads[cid_].seeds[for_];
    }

    function unlockKeySeed(string calldata cid_) external payable {
        require(uploads[cid_].timestamp != 0, "File not exist");
        require(uploads[cid_].expiration > block.timestamp, "Key has expired");
        require(
            msg.value >= uploads[cid_].cost,
            "Insufficient payment for key"
        );
        require(
            uploads[cid_].seeds[msg.sender].length != 0,
            "No key registered for this address"
        );

        uint256 fees = msg.value / 10;

        payable(uploads[cid_].owner).transfer(msg.value - fees);
        payable(address(_orchestrator)).transfer(fees);

        uploads[cid_].paid[msg.sender] = true;
    }
}

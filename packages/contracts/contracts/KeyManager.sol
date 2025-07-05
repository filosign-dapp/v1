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
    mapping(address => string[]) private userReceivedFiles;
    mapping(address => string[]) private userUploadedFiles;

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

    function filesReceived() external view returns (string[] memory) {
        address recepient = msg.sender;

        require(
            _orchestrator.iam().registered(recepient),
            "User not registered"
        );
        return userReceivedFiles[recepient];
    }

    function filesUploaded() external view returns (string[] memory) {
        address uploader = msg.sender;

        require(
            _orchestrator.iam().registered(uploader),
            "User not registered"
        );
        return userUploadedFiles[uploader];
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
        require(
            for_.length == values_.length,
            "Recipients and values length mismatch"
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
            userReceivedFiles[for_[i]][
                userReceivedFiles[for_[i]].length
            ] = cid_;
        }
        userUploadedFiles[msg.sender][
            userUploadedFiles[msg.sender].length
        ] = cid_;
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

    function unlockKeySeed(
        string calldata cid_ //  payable
    ) external {
        require(uploads[cid_].timestamp != 0, "File not exist");
        require(uploads[cid_].expiration > block.timestamp, "Key has expired");
        require(
            uploads[cid_].seeds[msg.sender].length != 0,
            "No key registered for this address"
        );

        uint256 cost = uploads[cid_].cost;
        uint256 fees = cost / 10;

        _orchestrator.spend(cost - fees, msg.sender, uploads[cid_].owner);
        _orchestrator.receivePayment(
            fees,
            msg.sender,
            "Fees for unlocking image"
        );

        uploads[cid_].paid[msg.sender] = true;
    }
}

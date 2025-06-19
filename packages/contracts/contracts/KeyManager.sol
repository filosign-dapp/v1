// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";

contract KeyManager {
    struct Key {
        address uploader;
        string cid;
        uint256 timestamp;
        bytes32 seed;
    }

    mapping(string => Key) public uploads;

    function registerUpload(string calldata cid) external {
        require(bytes(uploads[cid].cid).length == 0, "Already registered");
        uploads[cid] = Key(
            msg.sender,
            cid,
            block.timestamp,
            bytes32(abi.encodePacked("seed-", cid, "-", block.number))
        );
    }

    function getKey(string calldata cid) external view returns (Key memory) {
        require(bytes(uploads[cid].cid).length != 0, "Not registered");
        return uploads[cid];
    }
}

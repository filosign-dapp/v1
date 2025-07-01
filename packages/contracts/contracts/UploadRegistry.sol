// // SPDX-License-Identifier: MIT
// pragma solidity ^0.8.28;

// import "./PortalOrchestrator.sol";

// contract UploadRegistry {
//     struct Upload {
//         address uploader;
//         address owner;
//         uint256 timestamp;
//         string cid;
//     }

//     PortalOrchestrator private _orchestrator;

//     mapping(string => Key) public uploads;

//     constructor() {
//         _orchestrator = PortalOrchestrator(msg.sender);
//     }

//     function registerUpload(string calldata cid) external {
//         require(uploads[cid].timestamp == 0, "Already registered");
//         require(bytes(cid).length > 0, "CID cannot be empty");
//         require(
//             _orchestrator.iam().registered(msg.sender),
//             "User not registered"
//         );

//         uploads[cid] = Key(
//             _orchestrator.iam().resolvePublicKey(msg.sender),
//             msg.sender,
//             block.timestamp,
//             bytes32(abi.encodePacked("seed-", cid, "-", block.number))
//         );
//     }

//     function getKey(string calldata cid) external view returns (Key memory) {
//         require(uploads[cid].timestamp != 0, "Not registered");
//         return uploads[cid];
//     }
// }

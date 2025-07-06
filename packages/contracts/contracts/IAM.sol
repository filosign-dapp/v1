// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./SignatureVerifier.sol";
import "./PortalOrchestrator.sol";

contract IAM is SignatureVerifier {
    struct Account {
        bytes pub;
        address pubAddr;
        bytes32 seed;
    }

    uint256 private _nonce;
    uint256 public constant REGISTRATION_FEE = 1 ether;

    mapping(address => Account) public accounts;
    mapping(address => bool) public registered;

    PortalOrchestrator private _orchestrator;

    constructor() {
        _nonce = block.number;
        _orchestrator = PortalOrchestrator(msg.sender); // assume the orchestrator to be the contract deployer
    }

    function getNonce() external view returns (uint256) {
        return _nonce;
    }

    function resolvePublicKey(
        address addr_
    ) external view returns (bytes memory) {
        return accounts[addr_].pub;
    }

    function resolvePublicKeyAddress(
        address addr_
    ) external view returns (address) {
        return accounts[addr_].pubAddr;
    }

    function incrementNonce() internal {
        _nonce++;
    }

    function determineNextSeed(address for_) public view returns (bytes32) {
        return bytes32(abi.encodePacked(for_, _nonce));
    }

    function register(
        bytes memory pub_,
        address pubAddr_,
        bytes calldata signature_ // payable
    ) external {
        require(
            accounts[msg.sender].pubAddr == address(0),
            "Already registered"
        );

        // _orchestrator.receivePayment(1, msg.sender, "Registration fee");
        bytes32 seed = determineNextSeed(msg.sender);
        bytes32 digest = keccak256(abi.encodePacked(msg.sender, seed));
        require(
            verifySignature(pubAddr_, digest, signature_),
            "Invalid signature"
        );

        accounts[msg.sender] = Account(pub_, pubAddr_, seed);
        registered[msg.sender] = true;

        incrementNonce();
    }

    function isValidPubKey(
        address addr,
        bytes memory pubKey
    ) public pure returns (bool) {
        require(
            pubKey.length == 64 || pubKey.length == 65,
            "Invalid pubkey length"
        );

        bytes memory fullPubKey = pubKey;
        if (pubKey.length == 65) {
            require(pubKey[0] == 0x04, "Must be uncompressed pubkey");
            fullPubKey = slice(pubKey, 1, 64);
        }

        bytes32 hash = keccak256(fullPubKey);
        address derived = address(uint160(uint256(hash)));

        return derived == addr;
    }

    function slice(
        bytes memory data,
        uint start,
        uint len
    ) internal pure returns (bytes memory) {
        bytes memory out = new bytes(len);
        for (uint i = 0; i < len; i++) {
            out[i] = data[i + start];
        }
        return out;
    }
}

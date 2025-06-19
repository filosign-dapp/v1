// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "hardhat/console.sol";
import "./SignatureVerifier.sol";

contract KeyManager is SignatureVerifier {
    struct Account {
        address pub;
        bytes32 seed;
    }

    uint256 private _nonce;

    mapping(address => Account) public accounts;

    constructor() {
        _nonce = block.number;
    }

    function getNonce() external view returns (uint256) {
        return _nonce;
    }

    function determineNextSeed() public view returns (bytes32) {
        return bytes32(abi.encodePacked("seed-", msg.sender, "-", _nonce));
    }

    function register(address pub_) external {
        require(accounts[msg.sender].pub == address(0), "Already registered");

        bytes32 seed = determineNextSeed();
        require(validate(pub_, seed, msg.data), "Invalid signature");

        accounts[msg.sender] = Account(msg.sender, seed);
    }

    function validate(
        address from_,
        bytes32 seed_,
        bytes calldata signature_
    ) private pure returns (bool) {
        bytes32 digest = keccak256(abi.encodePacked(from_, seed_));

        return verifySignature(from_, digest, signature_);
    }
}

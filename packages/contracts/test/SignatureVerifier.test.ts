import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, keccak256 } from "viem";

describe("SignatureVerifier", function () {
  async function deploySignatureVerifierFixture() {
    const [owner, otherAccount] = await hre.viem.getWalletClients();

    const signatureVerifier = await hre.viem.deployContract(
      "SignatureVerifier"
    );

    return {
      signatureVerifier,
      owner,
      otherAccount,
    };
  }

  describe("Signature Verification", function () {
    it("Should verify valid signature correctly", async function () {
      const { signatureVerifier, owner } = await loadFixture(
        deploySignatureVerifierFixture
      );

      const message =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const messageHash = keccak256(message);

      // Sign the message hash
      const signature = await owner.signMessage({
        message: { raw: messageHash },
      });

      const isValid = await signatureVerifier.read.verifySignature([
        getAddress(owner.account.address),
        messageHash,
        signature,
      ]);

      expect(isValid).to.be.true;
    });

    it("Should reject invalid signature", async function () {
      const { signatureVerifier, owner, otherAccount } = await loadFixture(
        deploySignatureVerifierFixture
      );

      const message =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const messageHash = keccak256(message);

      // Sign with one account but verify with another
      const signature = await otherAccount.signMessage({
        message: { raw: messageHash },
      });

      const isValid = await signatureVerifier.read.verifySignature([
        getAddress(owner.account.address),
        messageHash,
        signature,
      ]);

      expect(isValid).to.be.false;
    });

    it("Should reject signature with wrong message hash", async function () {
      const { signatureVerifier, owner } = await loadFixture(
        deploySignatureVerifierFixture
      );

      const message1 =
        "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const message2 =
        "0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321";

      const messageHash1 = keccak256(message1);
      const messageHash2 = keccak256(message2);

      // Sign one message but verify with different hash
      const signature = await owner.signMessage({
        message: { raw: messageHash1 },
      });

      const isValid = await signatureVerifier.read.verifySignature([
        getAddress(owner.account.address),
        messageHash2,
        signature,
      ]);

      expect(isValid).to.be.false;
    });
  });
});

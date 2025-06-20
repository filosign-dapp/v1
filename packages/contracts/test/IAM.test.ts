import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, keccak256, encodeAbiParameters, type Address } from "viem";

describe("IAM", function () {
  async function deployIAMFixture() {
    const [owner, user, otherAccount] = await hre.viem.getWalletClients();

    const iam = await hre.viem.deployContract("IAM");

    return {
      iam,
      owner,
      user,
      otherAccount,
    };
  }

  async function registerUser(iam: any, user: any) {
    const iamAsUser = await hre.viem.getContractAt("IAM", iam.address, {
      client: { wallet: user },
    });

    const seed = await iamAsUser.read.determineNextSeed();
    const digest = keccak256(
      encodeAbiParameters(
        [{ type: "address" }, { type: "bytes32" }],
        [getAddress(user.account.address), seed]
      )
    );

    const signature = await user.signMessage({
      message: { raw: digest },
    });

    await iamAsUser.write.register([
      getAddress(user.account.address),
      signature,
    ]);

    return { iamAsUser, seed, digest, signature };
  }

  describe("Nonce Management", function () {
    it("Should initialize nonce correctly", async function () {
      const { iam } = await loadFixture(deployIAMFixture);

      const nonce = await iam.read.getNonce();
      expect(Number(nonce)).to.be.greaterThan(0);
    });

    it("Should increment nonce after registration", async function () {
      const { iam, user } = await loadFixture(deployIAMFixture);

      const initialNonce = await iam.read.getNonce();

      await registerUser(iam, user);

      const newNonce = await iam.read.getNonce();
      console.log(initialNonce, newNonce);
      expect(newNonce).to.equal(initialNonce + 1n);
    });
  });

  // describe("Account Registration", function () {
  //   it("Should register account with valid signature", async function () {
  //     const { iam, user } = await loadFixture(deployIAMFixture);

  //     const { seed } = await registerUser(iam, user);

  //     // Verify registration
  //     const isRegistered = await iam.read.registered([
  //       getAddress(user.account.address),
  //     ]);
  //     expect(isRegistered).to.be.true;

  //     const account = await iam.read.accounts([
  //       getAddress(user.account.address),
  //     ]);
  //     expect(account[0].toLowerCase()).to.equal(
  //       getAddress(user.account.address).toLowerCase()
  //     );
  //     expect(account[1]).to.equal(seed);
  //   });

  //   it("Should prevent double registration", async function () {
  //     const { iam, user } = await loadFixture(deployIAMFixture);

  //     // First registration
  //     await registerUser(iam, user);

  //     // Try to register again - should fail
  //     const iamAsUser = await hre.viem.getContractAt("IAM", iam.address, {
  //       client: { wallet: user },
  //     });

  //     const seed = await iamAsUser.read.determineNextSeed();
  //     const digest = keccak256(
  //       encodeAbiParameters(
  //         [{ type: "address" }, { type: "bytes32" }],
  //         [getAddress(user.account.address), seed]
  //       )
  //     );
  //     const signature = await user.signMessage({
  //       message: { raw: digest },
  //     });

  //     await expect(
  //       iamAsUser.write.register([getAddress(user.account.address), signature])
  //     ).to.be.rejectedWith("Already registered");
  //   });

  //   it("Should resolve public key correctly", async function () {
  //     const { iam, user } = await loadFixture(deployIAMFixture);

  //     // Register user first
  //     await registerUser(iam, user);

  //     // Resolve public key
  //     const resolvedKey = await iam.read.resolvePublicKey([
  //       getAddress(user.account.address),
  //     ]);
  //     expect(resolvedKey.toLowerCase()).to.equal(
  //       getAddress(user.account.address).toLowerCase()
  //     );
  //   });

  //   it("Should return zero address for unregistered account", async function () {
  //     const { iam, user } = await loadFixture(deployIAMFixture);

  //     const resolvedKey = await iam.read.resolvePublicKey([
  //       getAddress(user.account.address),
  //     ]);
  //     expect(resolvedKey).to.equal(
  //       "0x0000000000000000000000000000000000000000"
  //     );
  //   });

  //   it("Should generate deterministic seeds", async function () {
  //     const { iam, user } = await loadFixture(deployIAMFixture);

  //     const iamAsUser = await hre.viem.getContractAt("IAM", iam.address, {
  //       client: { wallet: user },
  //     });

  //     const seed1 = await iamAsUser.read.determineNextSeed();
  //     const seed2 = await iamAsUser.read.determineNextSeed();

  //     // Seeds should be the same when called consecutively without state change
  //     expect(seed1).to.equal(seed2);

  //     // Should contain expected elements
  //     const seedString = seed1.slice(2); // Remove 0x prefix
  //     expect(seedString.length).to.equal(64); // 32 bytes = 64 hex chars
  //   });
  // });

  // describe("Signature Validation", function () {
  //   it("Should reject invalid signatures", async function () {
  //     const { iam, user, otherAccount } = await loadFixture(deployIAMFixture);

  //     const iamAsUser = await hre.viem.getContractAt("IAM", iam.address, {
  //       client: { wallet: user },
  //     });

  //     const seed = await iamAsUser.read.determineNextSeed();
  //     const digest = keccak256(
  //       encodeAbiParameters(
  //         [{ type: "address" }, { type: "bytes32" }],
  //         [getAddress(user.account.address), seed]
  //       )
  //     );

  //     // Sign with different account
  //     const wrongSignature = await otherAccount.signMessage({
  //       message: { raw: digest },
  //     });

  //     await expect(
  //       iamAsUser.write.register([
  //         getAddress(user.account.address),
  //         wrongSignature,
  //       ])
  //     ).to.be.rejectedWith("Invalid signature");
  //   });

  //   it("Should reject signatures with wrong message", async function () {
  //     const { iam, user } = await loadFixture(deployIAMFixture);

  //     const iamAsUser = await hre.viem.getContractAt("IAM", iam.address, {
  //       client: { wallet: user },
  //     });

  //     // Sign wrong message
  //     const wrongDigest = keccak256(
  //       encodeAbiParameters(
  //         [{ type: "address" }, { type: "bytes32" }],
  //         [
  //           getAddress(user.account.address),
  //           "0x1234567890123456789012345678901234567890123456789012345678901234",
  //         ]
  //       )
  //     );

  //     const wrongSignature = await user.signMessage({
  //       message: { raw: wrongDigest },
  //     });

  //     await expect(
  //       iamAsUser.write.register([
  //         getAddress(user.account.address),
  //         wrongSignature,
  //       ])
  //     ).to.be.rejectedWith("Invalid signature");
  //   });
  // });
});

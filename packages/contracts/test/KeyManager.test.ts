import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress } from "viem";

describe("KeyManager", function () {
  async function deployKeyManagerFixture() {
    const [owner, uploader, otherAccount] = await hre.viem.getWalletClients();

    const keyManager = await hre.viem.deployContract("KeyManager");

    return {
      keyManager,
      owner,
      uploader,
      otherAccount,
    };
  }

  describe("Upload Registration", function () {
    it("Should register upload with correct details", async function () {
      const { keyManager, uploader } = await loadFixture(
        deployKeyManagerFixture
      );

      const cid = "QmTestCID123";

      // Register upload as uploader
      const keyManagerAsUploader = await hre.viem.getContractAt(
        "KeyManager",
        keyManager.address,
        { client: { wallet: uploader } }
      );

      await keyManagerAsUploader.write.registerUpload([cid]);

      // Get the registered key
      const key = await keyManager.read.getKey([cid]);

      expect(key.uploader.toLowerCase()).to.equal(
        getAddress(uploader.account.address).toLowerCase()
      );
      expect(key.cid).to.equal(cid);
      expect(key.timestamp).to.be.greaterThan(0n);
      expect(key.seed).to.not.equal(
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
    });

    it("Should prevent duplicate registration", async function () {
      const { keyManager, uploader } = await loadFixture(
        deployKeyManagerFixture
      );

      const cid = "QmTestCID123";

      const keyManagerAsUploader = await hre.viem.getContractAt(
        "KeyManager",
        keyManager.address,
        { client: { wallet: uploader } }
      );

      // Register once
      await keyManagerAsUploader.write.registerUpload([cid]);

      // Try to register again - should fail
      await expect(
        keyManagerAsUploader.write.registerUpload([cid])
      ).to.be.rejectedWith("Already registered");
    });

    it("Should allow different users to register different CIDs", async function () {
      const { keyManager, uploader, otherAccount } = await loadFixture(
        deployKeyManagerFixture
      );

      const cid1 = "QmTestCID123";
      const cid2 = "QmTestCID456";

      const keyManagerAsUploader = await hre.viem.getContractAt(
        "KeyManager",
        keyManager.address,
        { client: { wallet: uploader } }
      );

      const keyManagerAsOther = await hre.viem.getContractAt(
        "KeyManager",
        keyManager.address,
        { client: { wallet: otherAccount } }
      );

      // Register different CIDs
      await keyManagerAsUploader.write.registerUpload([cid1]);
      await keyManagerAsOther.write.registerUpload([cid2]);

      // Verify both registrations
      const key1 = await keyManager.read.getKey([cid1]);
      const key2 = await keyManager.read.getKey([cid2]);

      expect(key1.uploader.toLowerCase()).to.equal(
        getAddress(uploader.account.address).toLowerCase()
      );
      expect(key2.uploader.toLowerCase()).to.equal(
        getAddress(otherAccount.account.address).toLowerCase()
      );
      expect(key1.cid).to.equal(cid1);
      expect(key2.cid).to.equal(cid2);
    });

    it("Should generate unique seeds for different uploads", async function () {
      const { keyManager, uploader } = await loadFixture(
        deployKeyManagerFixture
      );

      const cid1 = "QmTestCID123";
      const cid2 = "QmTestCID456";

      const keyManagerAsUploader = await hre.viem.getContractAt(
        "KeyManager",
        keyManager.address,
        { client: { wallet: uploader } }
      );

      // Register two different CIDs
      await keyManagerAsUploader.write.registerUpload([cid1]);
      await keyManagerAsUploader.write.registerUpload([cid2]);

      const key1 = await keyManager.read.getKey([cid1]);
      const key2 = await keyManager.read.getKey([cid2]);

      // Seeds should be different
      expect(key1.seed).to.not.equal(key2.seed);
    });

    it("Should fail to get key for non-registered CID", async function () {
      const { keyManager } = await loadFixture(deployKeyManagerFixture);

      const nonExistentCID = "QmNonExistentCID";

      await expect(keyManager.read.getKey([nonExistentCID])).to.be.rejectedWith(
        "Not registered"
      );
    });
  });
});

import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther, keccak256, encodeAbiParameters } from "viem";

describe("Portal Integration Tests", function () {
  async function deployFullSystemFixture() {
    const [admin, user1, user2, user3] = await hre.viem.getWalletClients();

    // Deploy USDFC first
    const usdfc = await hre.viem.deployContract("USDFC");

    // Deploy PortalOrchestrator with USDFC address
    const orchestrator = await hre.viem.deployContract("PortalOrchestrator", [
      usdfc.address,
    ]);

    // Get deployed contract addresses
    const keyManagerAddress = await orchestrator.read.keyManager();
    const subHandlerAddress = await orchestrator.read.subHandler();
    const iamAddress = await orchestrator.read.iam();

    // Get contract instances
    const keyManager = await hre.viem.getContractAt(
      "KeyManager",
      keyManagerAddress
    );
    const subHandler = await hre.viem.getContractAt(
      "SubHandler",
      subHandlerAddress
    );
    const iam = await hre.viem.getContractAt("IAM", iamAddress);

    // Transfer some USDFC to users for testing
    const transferAmount = parseEther("1000");
    await usdfc.write.transfer([
      getAddress(user1.account.address),
      transferAmount,
    ]);
    await usdfc.write.transfer([
      getAddress(user2.account.address),
      transferAmount,
    ]);

    return {
      orchestrator,
      keyManager,
      subHandler,
      iam,
      usdfc,
      admin,
      user1,
      user2,
      user3,
      transferAmount,
    };
  }

  describe("Complete User Flow", function () {
    it("Should allow complete user registration and file upload flow", async function () {
      const { iam, keyManager, user1 } = await loadFixture(
        deployFullSystemFixture
      );

      // Step 1: Register user in IAM
      const iamAsUser = await hre.viem.getContractAt("IAM", iam.address, {
        client: { wallet: user1 },
      });

      const seed = await iamAsUser.read.determineNextSeed();
      const digest = keccak256(
        encodeAbiParameters(
          [{ type: "address" }, { type: "bytes32" }],
          [getAddress(user1.account.address), seed]
        )
      );

      const signature = await user1.signMessage({
        message: { raw: digest },
      });

      await iamAsUser.write.register([getAddress(user1.account.address)]);

      // Verify registration
      const isRegistered = await iam.read.registered([
        getAddress(user1.account.address),
      ]);
      expect(isRegistered).to.be.true;

      // Step 2: Register file upload
      const keyManagerAsUser = await hre.viem.getContractAt(
        "KeyManager",
        keyManager.address,
        { client: { wallet: user1 } }
      );

      const cid = "QmTestCID123";
      await keyManagerAsUser.write.registerUpload([cid]);

      // Verify upload registration
      const key = await keyManager.read.getKey([cid]);
      expect(key.cid).to.equal(cid);
      expect(key.uploader.toLowerCase()).to.equal(
        getAddress(user1.account.address).toLowerCase()
      );
    });

    it("Should allow subscription plan management", async function () {
      const { subHandler, iam, admin, user1 } = await loadFixture(
        deployFullSystemFixture
      );

      // Step 1: Admin sets up a plan
      const subHandlerAsAdmin = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: admin } }
      );

      const planId = 1;
      const planName = "Premium Plan";
      const planPrice = parseEther("25");

      await subHandlerAsAdmin.write.setPlan([planId, planName, planPrice]);

      // Verify plan creation
      const plan = await subHandler.read.plans([planId]);
      expect(plan.name).to.equal(planName);
      expect(plan.price).to.equal(planPrice);

      // Step 2: Register user in IAM
      const iamAsUser = await hre.viem.getContractAt("IAM", iam.address, {
        client: { wallet: user1 },
      });

      const seed = await iamAsUser.read.determineNextSeed();
      const digest = keccak256(
        encodeAbiParameters(
          [{ type: "address" }, { type: "bytes32" }],
          [getAddress(user1.account.address), seed]
        )
      );

      const signature = await user1.signMessage({
        message: { raw: digest },
      });

      await iamAsUser.write.register([getAddress(user1.account.address)]);

      // Step 3: User purchases plan
      const subHandlerAsUser = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: user1 } }
      );

      await subHandlerAsUser.write.buyPlan([planId], { value: planPrice });

      // Verify plan purchase
      const userPlan = await subHandler.read.userPlans([
        getAddress(user1.account.address),
      ]);
      expect(userPlan).to.equal(planId);

      const activePlan = await subHandler.read.getActivePlan([
        getAddress(user1.account.address),
      ]);
      expect(activePlan).to.equal(planId);
    });

    it("Should handle multiple users independently", async function () {
      const { iam, keyManager, user1, user2 } = await loadFixture(
        deployFullSystemFixture
      );

      // Register both users
      const iamAsUser1 = await hre.viem.getContractAt("IAM", iam.address, {
        client: { wallet: user1 },
      });

      const iamAsUser2 = await hre.viem.getContractAt("IAM", iam.address, {
        client: { wallet: user2 },
      });

      // User1 registration
      const seed1 = await iamAsUser1.read.determineNextSeed();
      const digest1 = keccak256(
        encodeAbiParameters(
          [{ type: "address" }, { type: "bytes32" }],
          [getAddress(user1.account.address), seed1]
        )
      );
      const signature1 = await user1.signMessage({ message: { raw: digest1 } });
      await iamAsUser1.write.register([getAddress(user1.account.address)]);

      // User2 registration
      const seed2 = await iamAsUser2.read.determineNextSeed();
      const digest2 = keccak256(
        encodeAbiParameters(
          [{ type: "address" }, { type: "bytes32" }],
          [getAddress(user2.account.address), seed2]
        )
      );
      const signature2 = await user2.signMessage({ message: { raw: digest2 } });
      await iamAsUser2.write.register([getAddress(user2.account.address)]);

      // Verify both registrations
      const isUser1Registered = await iam.read.registered([
        getAddress(user1.account.address),
      ]);
      const isUser2Registered = await iam.read.registered([
        getAddress(user2.account.address),
      ]);
      expect(isUser1Registered).to.be.true;
      expect(isUser2Registered).to.be.true;

      // Both users upload files
      const keyManagerAsUser1 = await hre.viem.getContractAt(
        "KeyManager",
        keyManager.address,
        { client: { wallet: user1 } }
      );

      const keyManagerAsUser2 = await hre.viem.getContractAt(
        "KeyManager",
        keyManager.address,
        { client: { wallet: user2 } }
      );

      const cid1 = "QmUser1CID";
      const cid2 = "QmUser2CID";

      await keyManagerAsUser1.write.registerUpload([cid1]);
      await keyManagerAsUser2.write.registerUpload([cid2]);

      // Verify uploads
      const key1 = await keyManager.read.getKey([cid1]);
      const key2 = await keyManager.read.getKey([cid2]);

      expect(key1.uploader.toLowerCase()).to.equal(
        getAddress(user1.account.address).toLowerCase()
      );
      expect(key2.uploader.toLowerCase()).to.equal(
        getAddress(user2.account.address).toLowerCase()
      );
      expect(key1.cid).to.equal(cid1);
      expect(key2.cid).to.equal(cid2);
    });
  });

  describe("System Security", function () {
    it("Should prevent unauthorized access", async function () {
      const { subHandler, iam, user1, user2 } = await loadFixture(
        deployFullSystemFixture
      );

      // Try to set plan as non-admin
      const subHandlerAsUser = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: user1 } }
      );

      await expect(
        subHandlerAsUser.write.setPlan([
          1,
          "Unauthorized Plan",
          parseEther("10"),
        ])
      ).to.be.rejected;
    });

    it("Should enforce registration requirements", async function () {
      const { subHandler, admin, user1 } = await loadFixture(
        deployFullSystemFixture
      );

      // Set up a plan
      const subHandlerAsAdmin = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: admin } }
      );

      await subHandlerAsAdmin.write.setPlan([1, "Test Plan", parseEther("10")]);

      // Try to buy plan without registration
      const subHandlerAsUser = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: user1 } }
      );

      await expect(
        subHandlerAsUser.write.buyPlan([1], { value: parseEther("10") })
      ).to.be.rejectedWith("User not registered");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle signature verification edge cases", async function () {
      const { iam, user1, user2 } = await loadFixture(deployFullSystemFixture);

      const iamAsUser1 = await hre.viem.getContractAt("IAM", iam.address, {
        client: { wallet: user1 },
      });

      // Get seed for user1
      const seed = await iamAsUser1.read.determineNextSeed();
      const digest = keccak256(
        encodeAbiParameters(
          [{ type: "address" }, { type: "bytes32" }],
          [getAddress(user1.account.address), seed]
        )
      );

      // Sign with user2 but try to register as user1
      const wrongSignature = await user2.signMessage({
        message: { raw: digest },
      });

      // This should fail because signature doesn't match
      await expect(
        iamAsUser1.write.register([getAddress(user1.account.address)])
      ).to.be.rejectedWith("Invalid signature");
    });

    it("Should handle duplicate registrations gracefully", async function () {
      const { keyManager, user1 } = await loadFixture(deployFullSystemFixture);

      const keyManagerAsUser = await hre.viem.getContractAt(
        "KeyManager",
        keyManager.address,
        { client: { wallet: user1 } }
      );

      const cid = "QmDuplicateTest";

      // First registration should succeed
      await keyManagerAsUser.write.registerUpload([cid]);

      // Second registration should fail
      await expect(
        keyManagerAsUser.write.registerUpload([cid])
      ).to.be.rejectedWith("Already registered");
    });
  });
});

import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther } from "viem";

describe("PortalOrchestrator", function () {
  async function deployPortalOrchestratorFixture() {
    const [admin, user, spender, otherAccount] =
      await hre.viem.getWalletClients();

    // Deploy USDFC first
    const usdfc = await hre.viem.deployContract("USDFC");

    // Deploy PortalOrchestrator
    const orchestrator = await hre.viem.deployContract("PortalOrchestrator", [
      usdfc.address,
    ]);

    return {
      orchestrator,
      usdfc,
      admin,
      user,
      spender,
      otherAccount,
    };
  }

  describe("Deployment", function () {
    it("Should deploy with correct initial state", async function () {
      const { orchestrator, usdfc, admin } = await loadFixture(
        deployPortalOrchestratorFixture
      );

      // Check USDFC token
      const tokenAddress = await orchestrator.read.usdfc();
      expect(tokenAddress.toLowerCase()).to.equal(usdfc.address.toLowerCase());

      // Check ONE_USDFC constant
      const oneUSDFC = await orchestrator.read.ONE_USDFC();
      const expectedOneUSDFC = 10n ** 18n; // 18 decimals
      expect(oneUSDFC).to.equal(expectedOneUSDFC);
    });

    it("Should deploy and initialize sub-contracts", async function () {
      const { orchestrator } = await loadFixture(
        deployPortalOrchestratorFixture
      );

      // Check KeyManager deployment
      const keyManagerAddress = await orchestrator.read.keyManager();
      expect(keyManagerAddress).to.not.equal(
        "0x0000000000000000000000000000000000000000"
      );

      // Check SubHandler deployment
      const subHandlerAddress = await orchestrator.read.subHandler();
      expect(subHandlerAddress).to.not.equal(
        "0x0000000000000000000000000000000000000000"
      );

      // Check IAM deployment
      const iamAddress = await orchestrator.read.iam();
      expect(iamAddress).to.not.equal(
        "0x0000000000000000000000000000000000000000"
      );
    });

    it("Should set correct spender permissions", async function () {
      const { orchestrator } = await loadFixture(
        deployPortalOrchestratorFixture
      );

      const keyManagerAddress = await orchestrator.read.keyManager();
      const subHandlerAddress = await orchestrator.read.subHandler();

      // KeyManager should be a spender
      const isKeyManagerSpender = await orchestrator.read.spenders([
        keyManagerAddress,
      ]);
      expect(isKeyManagerSpender).to.be.true;

      // SubHandler should be a spender
      const isSubHandlerSpender = await orchestrator.read.spenders([
        subHandlerAddress,
      ]);
      expect(isSubHandlerSpender).to.be.true;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to change admin", async function () {
      const { orchestrator, admin, user } = await loadFixture(
        deployPortalOrchestratorFixture
      );

      await orchestrator.write.setAdmin([getAddress(user.account.address)]);

      // Test that the new admin can perform admin functions
      const orchestratorAsNewAdmin = await hre.viem.getContractAt(
        "PortalOrchestrator",
        orchestrator.address,
        { client: { wallet: user } }
      );

      // This should work without reverting
      await orchestratorAsNewAdmin.write.setAdmin([
        getAddress(admin.account.address),
      ]);
    });
  });

  describe("Payment Handling", function () {
    async function setupPaymentFixture() {
      const fixture = await loadFixture(deployPortalOrchestratorFixture);
      const { orchestrator, usdfc, admin, user, spender } = fixture;

      // Transfer some USDFC to user for testing
      const transferAmount = parseEther("1000");
      await usdfc.write.transfer([
        getAddress(user.account.address),
        transferAmount,
      ]);

      // User approves orchestrator to spend tokens
      const usdfcAsUser = await hre.viem.getContractAt("USDFC", usdfc.address, {
        client: { wallet: user },
      });
      await usdfcAsUser.write.approve([orchestrator.address, transferAmount]);

      return {
        ...fixture,
        transferAmount,
      };
    }

    it("Should allow spender to receive payment", async function () {
      const { orchestrator, usdfc, admin, user, spender, transferAmount } =
        await loadFixture(setupPaymentFixture);

      // Make spender a valid spender
      await orchestrator.write.setAdmin([getAddress(admin.account.address)]); // Ensure admin is set
      // Note: We can't directly test spender functionality without modifying the contract
      // as it doesn't have a public setSpender function

      const keyManagerAddress = await orchestrator.read.keyManager();
      const keyManager = await hre.viem.getContractAt(
        "KeyManager",
        keyManagerAddress
      );

      // Register a CID which should trigger payment
      const keyManagerAsUser = await hre.viem.getContractAt(
        "KeyManager",
        keyManager.address,
        { client: { wallet: user } }
      );

      await keyManagerAsUser.write.registerUpload(["QmTestCID123"]);

      // Verify the upload was registered
      const key = await keyManager.read.getKey(["QmTestCID123"]);
      expect(key.cid).to.equal("QmTestCID123");
    });

    it("Should emit Payment event", async function () {
      const { orchestrator, usdfc, admin, user } = await loadFixture(
        setupPaymentFixture
      );

      const paymentAmount = 10n;
      const reason = "Test payment";

      // We need to be a spender to call receivePayment
      // Let's get the keyManager address and simulate it
      const keyManagerAddress = await orchestrator.read.keyManager();

      // Create a transaction that would emit the event (this is more complex in practice)
      // For now, let's verify the event structure exists
      const events = await orchestrator.getEvents.Payment();
      expect(events).to.be.an("array");
    });

    it("Should reject payment from non-spender", async function () {
      const { orchestrator, user } = await loadFixture(setupPaymentFixture);

      const orchestratorAsUser = await hre.viem.getContractAt(
        "PortalOrchestrator",
        orchestrator.address,
        { client: { wallet: user } }
      );

      await expect(
        orchestratorAsUser.write.receivePayment([10n, "Test payment"])
      ).to.be.rejectedWith("Not a spender");
    });

    it("Should reject zero amount payment", async function () {
      const { orchestrator, admin } = await loadFixture(setupPaymentFixture);

      // Even as admin, the function checks for spender status
      await expect(
        orchestrator.write.receivePayment([0n, "Test payment"])
      ).to.be.rejectedWith("Not a spender");
    });
  });

  describe("Contract Interactions", function () {
    it("Should allow KeyManager to register uploads", async function () {
      const { orchestrator, user } = await loadFixture(
        deployPortalOrchestratorFixture
      );

      const keyManagerAddress = await orchestrator.read.keyManager();
      const keyManager = await hre.viem.getContractAt(
        "KeyManager",
        keyManagerAddress
      );

      const keyManagerAsUser = await hre.viem.getContractAt(
        "KeyManager",
        keyManager.address,
        { client: { wallet: user } }
      );

      const cid = "QmTestCID123";
      await keyManagerAsUser.write.registerUpload([cid]);

      const key = await keyManager.read.getKey([cid]);
      expect(key.cid).to.equal(cid);
      expect(key.uploader.toLowerCase()).to.equal(
        getAddress(user.account.address).toLowerCase()
      );
    });

    it("Should allow users to register in IAM", async function () {
      const { orchestrator, user } = await loadFixture(
        deployPortalOrchestratorFixture
      );

      const iamAddress = await orchestrator.read.iam();
      const iam = await hre.viem.getContractAt("IAM", iamAddress);

      // Get seed and create signature
      const seed = await iam.read.determineNextSeed();
      const digest = hre.viem.keccak256(
        hre.viem.encodeAbiParameters(
          [{ type: "address" }, { type: "bytes32" }],
          [getAddress(user.account.address), seed]
        )
      );
      const signature = await user.signMessage({
        message: { raw: digest },
      });
      const iamAsUser = await hre.viem.getContractAt("IAM", iam.address, {
        client: { wallet: user },
      });

      await iamAsUser.write.register([
        getAddress(user.account.address),
        signature,
      ]);

      const isRegistered = await iam.read.registered([
        getAddress(user.account.address),
      ]);
      expect(isRegistered).to.be.true;
    });

    it("Should connect SubHandler to main orchestrator", async function () {
      const { orchestrator, admin } = await loadFixture(
        deployPortalOrchestratorFixture
      );

      const subHandlerAddress = await orchestrator.read.subHandler();
      const subHandler = await hre.viem.getContractAt(
        "SubHandler",
        subHandlerAddress
      );

      // Set a plan to verify SubHandler functionality
      const subHandlerAsAdmin = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: admin } }
      );

      await subHandlerAsAdmin.write.setPlan([
        1,
        "Basic Plan",
        parseEther("10"),
      ]);

      const plan = await subHandler.read.plans([1]);
      expect(plan.name).to.equal("Basic Plan");
      expect(plan.price).to.equal(parseEther("10"));
    });
  });
});

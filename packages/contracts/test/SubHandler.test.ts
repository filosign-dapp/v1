import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseEther, keccak256, encodeAbiParameters } from "viem";

describe("SubHandler", function () {
  async function deploySubHandlerFixture() {
    const [admin, user, otherAccount] = await hre.viem.getWalletClients();

    // Deploy USDFC first
    const usdfc = await hre.viem.deployContract("USDFC");

    // Deploy PortalOrchestrator with USDFC address
    const orchestrator = await hre.viem.deployContract("PortalOrchestrator", [
      usdfc.address,
    ]);

    // Get the SubHandler address from PortalOrchestrator
    const subHandlerAddress = await orchestrator.read.subHandler();

    // Get SubHandler contract instance
    const subHandler = await hre.viem.getContractAt(
      "SubHandler",
      subHandlerAddress
    );

    return {
      subHandler,
      orchestrator,
      usdfc,
      admin,
      user,
      otherAccount,
    };
  }

  describe("Plan Management", function () {
    it("Should allow owner to set plans", async function () {
      const { subHandler, admin } = await loadFixture(deploySubHandlerFixture);

      const planId = 1;
      const planName = "Basic Plan";
      const planPrice = parseEther("10");

      const subHandlerAsAdmin = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: admin } }
      );

      await subHandlerAsAdmin.write.setPlan([planId, planName, planPrice]);
      const plan = await subHandler.read.plans([planId]);
      expect(plan[0]).to.equal(planName);
      expect(plan[1]).to.equal(planPrice);
    });

    it("Should prevent non-owner from setting plans", async function () {
      const { subHandler, user } = await loadFixture(deploySubHandlerFixture);

      const planId = 1;
      const planName = "Basic Plan";
      const planPrice = parseEther("10");

      const subHandlerAsUser = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: user } }
      );

      await expect(
        subHandlerAsUser.write.setPlan([planId, planName, planPrice])
      ).to.be.rejected; // OwnableUnauthorizedAccount
    });

    it("Should reject invalid plan parameters", async function () {
      const { subHandler, admin } = await loadFixture(deploySubHandlerFixture);

      const subHandlerAsAdmin = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: admin } }
      );

      // Invalid plan ID (0)
      await expect(
        subHandlerAsAdmin.write.setPlan([0, "Test Plan", parseEther("10")])
      ).to.be.rejectedWith("Invalid plan ID");

      // Invalid price (0)
      await expect(
        subHandlerAsAdmin.write.setPlan([1, "Test Plan", 0n])
      ).to.be.rejectedWith("Price must be greater than zero");
    });
  });

  describe("Plan Purchase", function () {
    async function setupPlanFixture() {
      const fixture = await loadFixture(deploySubHandlerFixture);
      const { subHandler, orchestrator, admin, user } = fixture;

      // Set up a plan
      const planId = 1;
      const planName = "Basic Plan";
      const planPrice = parseEther("10");

      const subHandlerAsAdmin = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: admin } }
      );

      await subHandlerAsAdmin.write.setPlan([planId, planName, planPrice]);

      // Register user in IAM
      const iamAddress = await orchestrator.read.iam();
      const iam = await hre.viem.getContractAt("IAM", iamAddress);
      const seed = await iam.read.determineNextSeed();
      const digest = keccak256(
        encodeAbiParameters(
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

      return {
        ...fixture,
        planId,
        planName,
        planPrice,
        iam,
      };
    }

    it("Should allow registered user to buy plan with correct payment", async function () {
      const { subHandler, user, planId, planPrice } = await loadFixture(
        setupPlanFixture
      );

      const subHandlerAsUser = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: user } }
      );

      await subHandlerAsUser.write.buyPlan([planId], { value: planPrice });

      const userPlan = await subHandler.read.userPlans([
        getAddress(user.account.address),
      ]);
      expect(userPlan).to.equal(planId);
    });

    it("Should reject unregistered user from buying plan", async function () {
      const { subHandler, otherAccount, admin, planId, planPrice } =
        await loadFixture(setupPlanFixture);

      const subHandlerAsOther = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: otherAccount } }
      );

      await expect(
        subHandlerAsOther.write.buyPlan([planId], { value: planPrice })
      ).to.be.rejectedWith("User not registered");
    });

    it("Should reject incorrect payment amount", async function () {
      const { subHandler, user, planId, planPrice } = await loadFixture(
        setupPlanFixture
      );

      const subHandlerAsUser = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: user } }
      );

      const incorrectAmount = planPrice - parseEther("1");

      await expect(
        subHandlerAsUser.write.buyPlan([planId], { value: incorrectAmount })
      ).to.be.rejectedWith("Incorrect payment");
    });

    it("Should reject invalid plan ID", async function () {
      const { subHandler, user, planPrice } = await loadFixture(
        setupPlanFixture
      );

      const invalidPlanId = 999;

      const subHandlerAsUser = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: user } }
      );

      await expect(
        subHandlerAsUser.write.buyPlan([invalidPlanId], { value: planPrice })
      ).to.be.rejectedWith("Invalid plan");
    });

    it("Should get active plan for user", async function () {
      const { subHandler, user, planId, planPrice } = await loadFixture(
        setupPlanFixture
      );

      const subHandlerAsUser = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: user } }
      );

      await subHandlerAsUser.write.buyPlan([planId], { value: planPrice });

      const activePlan = await subHandler.read.getActivePlan([
        getAddress(user.account.address),
      ]);
      expect(activePlan).to.equal(planId);
    });

    it("Should fail to get active plan for user without plan", async function () {
      const { subHandler, otherAccount } = await loadFixture(setupPlanFixture);

      await expect(
        subHandler.read.getActivePlan([
          getAddress(otherAccount.account.address),
        ])
      ).to.be.rejectedWith("User has no active plan");
    });

    it("Should get plan expiry for user", async function () {
      const { subHandler, user, planId, planPrice } = await loadFixture(
        setupPlanFixture
      );

      const subHandlerAsUser = await hre.viem.getContractAt(
        "SubHandler",
        subHandler.address,
        { client: { wallet: user } }
      );

      await subHandlerAsUser.write.buyPlan([planId], { value: planPrice });
      const expiry = await subHandler.read.getPlanExpiry([
        getAddress(user.account.address),
      ]);
      expect(Number(expiry)).to.be.greaterThanOrEqual(0);
    });

    it("Should fail to get plan expiry for user without plan", async function () {
      const { subHandler, otherAccount } = await loadFixture(setupPlanFixture);

      await expect(
        subHandler.read.getPlanExpiry([
          getAddress(otherAccount.account.address),
        ])
      ).to.be.rejectedWith("User has no active plan");
    });
  });
});

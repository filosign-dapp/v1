import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { parseEther } from "viem";

describe("USDFC", function () {
  async function deployUSDFCFixture() {
    const [owner, user1, user2] = await hre.viem.getWalletClients();

    const usdfc = await hre.viem.deployContract("USDFC");

    return {
      usdfc,
      owner,
      user1,
      user2,
    };
  }

  describe("Deployment", function () {
    it("Should set the right token name and symbol", async function () {
      const { usdfc } = await loadFixture(deployUSDFCFixture);

      expect(await usdfc.read.name()).to.equal("test USDFC");
      expect(await usdfc.read.symbol()).to.equal("tUSDFC");
    });

    it("Should mint initial supply to deployer", async function () {
      const { usdfc, owner } = await loadFixture(deployUSDFCFixture);

      const decimals = await usdfc.read.decimals();
      const expectedSupply = 100_000_000n * 10n ** decimals;

      const totalSupply = await usdfc.read.totalSupply();
      const ownerBalance = await usdfc.read.balanceOf([owner.account.address]);

      expect(totalSupply).to.equal(expectedSupply);
      expect(ownerBalance).to.equal(expectedSupply);
    });

    it("Should have correct decimals", async function () {
      const { usdfc } = await loadFixture(deployUSDFCFixture);

      const decimals = await usdfc.read.decimals();
      expect(decimals).to.equal(18);
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens between accounts", async function () {
      const { usdfc, owner, user1 } = await loadFixture(deployUSDFCFixture);

      const transferAmount = parseEther("1000");

      await usdfc.write.transfer([user1.account.address, transferAmount]);

      const user1Balance = await usdfc.read.balanceOf([user1.account.address]);
      expect(user1Balance).to.equal(transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { usdfc, owner, user1, user2 } = await loadFixture(
        deployUSDFCFixture
      );

      const transferAmount = parseEther("1000");

      const usdfcAsUser1 = await hre.viem.getContractAt(
        "USDFC",
        usdfc.address,
        { client: { wallet: user1 } }
      );

      await expect(
        usdfcAsUser1.write.transfer([user2.account.address, transferAmount])
      ).to.be.rejectedWith("ERC20InsufficientBalance");
    });

    it("Should update balances after transfers", async function () {
      const { usdfc, owner, user1 } = await loadFixture(deployUSDFCFixture);

      const transferAmount = parseEther("1000");
      const initialOwnerBalance = await usdfc.read.balanceOf([
        owner.account.address,
      ]);

      await usdfc.write.transfer([user1.account.address, transferAmount]);

      const finalOwnerBalance = await usdfc.read.balanceOf([
        owner.account.address,
      ]);
      const user1Balance = await usdfc.read.balanceOf([user1.account.address]);

      expect(finalOwnerBalance).to.equal(initialOwnerBalance - transferAmount);
      expect(user1Balance).to.equal(transferAmount);
    });
  });

  describe("Allowance", function () {
    it("Should approve tokens for spending", async function () {
      const { usdfc, owner, user1 } = await loadFixture(deployUSDFCFixture);

      const approveAmount = parseEther("1000");

      await usdfc.write.approve([user1.account.address, approveAmount]);

      const allowance = await usdfc.read.allowance([
        owner.account.address,
        user1.account.address,
      ]);
      expect(allowance).to.equal(approveAmount);
    });

    it("Should allow transferFrom with proper allowance", async function () {
      const { usdfc, owner, user1, user2 } = await loadFixture(
        deployUSDFCFixture
      );

      const approveAmount = parseEther("1000");
      const transferAmount = parseEther("500");

      // Owner approves user1 to spend tokens
      await usdfc.write.approve([user1.account.address, approveAmount]);

      const usdfcAsUser1 = await hre.viem.getContractAt(
        "USDFC",
        usdfc.address,
        { client: { wallet: user1 } }
      );

      // User1 transfers from owner to user2
      await usdfcAsUser1.write.transferFrom([
        owner.account.address,
        user2.account.address,
        transferAmount,
      ]);

      const user2Balance = await usdfc.read.balanceOf([user2.account.address]);
      const remainingAllowance = await usdfc.read.allowance([
        owner.account.address,
        user1.account.address,
      ]);

      expect(user2Balance).to.equal(transferAmount);
      expect(remainingAllowance).to.equal(approveAmount - transferAmount);
    });

    it("Should fail transferFrom without sufficient allowance", async function () {
      const { usdfc, owner, user1, user2 } = await loadFixture(
        deployUSDFCFixture
      );

      const transferAmount = parseEther("1000");

      const usdfcAsUser1 = await hre.viem.getContractAt(
        "USDFC",
        usdfc.address,
        { client: { wallet: user1 } }
      );

      await expect(
        usdfcAsUser1.write.transferFrom([
          owner.account.address,
          user2.account.address,
          transferAmount,
        ])
      ).to.be.rejectedWith("ERC20InsufficientAllowance");
    });
  });
});

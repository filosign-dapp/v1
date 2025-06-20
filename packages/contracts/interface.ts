import definitions from "./definitions";
import * as viem from "viem";
import { filecoinCalibration } from "viem/chains";
import { abi as AbiPortalOrchestrator } from "./artifacts/contracts/PortalOrchestrator.sol/PortalOrchestrator.json";
import { abi as AbiIAM } from "./artifacts/contracts/IAM.sol/IAM.json";
import { abi as AbiSubHandler } from "./artifacts/contracts/SubHandler.sol/SubHandler.json";
import { abi as AbiKeyManager } from "./artifacts/contracts/KeyManager.sol/KeyManager.json";
import { abi as AbiERC20 } from "./artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";

const primaryChain = filecoinCalibration;

class Contracts {
  private client: viem.Client;

  constructor(account: viem.Account) {
    this.client = viem
      .createWalletClient({
        transport: viem.http(primaryChain.rpcUrls.default.http[0]),
        account,
      })
      .extend(viem.publicActions);
  }

  set account(account: viem.Account | undefined) {
    this.client.account = account;
    this.client = this.client.extend(viem.publicActions);
  }

  get account() {
    return this.client.account;
  }

  get interfaces() {
    return {
      portalOrchestrator: viem.getContract({
        abi: AbiPortalOrchestrator,
        address: definitions.portalOrchestrator,
        client: this.client,
      }),

      iam: viem.getContract({
        abi: AbiIAM,
        address: definitions.iam,
        client: this.client,
      }),

      subHandler: viem.getContract({
        abi: AbiSubHandler,
        address: definitions.subHandler,
        client: this.client,
      }),

      keyManager: viem.getContract({
        abi: AbiKeyManager,
        address: definitions.keyManager,
        client: this.client,
      }),

      usdfc: viem.getContract({
        abi: AbiERC20,
        address: definitions.usdfc,
        client: this.client,
      }),
    };
  }

  get portalOrchestrator() {
    return this.interfaces.portalOrchestrator;
  }

  get iam() {
    return this.interfaces.iam;
  }

  get subHandler() {
    return this.interfaces.subHandler;
  }

  get keyManager() {
    return this.interfaces.keyManager;
  }

  get usdfc() {
    return this.interfaces.usdfc;
  }
}

export default Contracts;

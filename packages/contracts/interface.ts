import definitions from "./definitions";
import * as viem from "viem";
import { filecoinCalibration } from "viem/chains";

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

const contracts = new Contracts({} as any)

contracts.portalOrchestrator.read.

export default Contracts;

import * as viem from "viem";
import { filecoinCalibration } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import PortalOrchestrator from "../artifacts/contracts/PortalOrchestrator.sol/PortalOrchestrator.json";
import IAM from "../artifacts/contracts/IAM.sol/IAM.json";
import SubHandler from "../artifacts/contracts/SubHandler.sol/SubHandler.json";
import KeyManager from "../artifacts/contracts/KeyManager.sol/KeyManager.json";

const primaryChain = filecoinCalibration;

if (!viem.isHex(Bun.env.PVT_KEY)) throw new Error("Pvt key mising");

const definitionsFile = Bun.file("../definitions.json");
const definitions: {
  name: string;
  abi: any;
  address: viem.Address;
}[] = [];

const client = viem
  .createWalletClient({
    transport: viem.http(primaryChain.rpcUrls.default.http[0]),
    account: privateKeyToAccount(Bun.env.PVT_KEY),
    chain: primaryChain,
  })
  .extend(viem.publicActions);

async function main() {
  if (!viem.isHex(PortalOrchestrator.bytecode))
    throw new Error("PortalOrchestrator bytecode is missing or invalid");

  const orchestratorHash = await client.deployContract({
    abi: PortalOrchestrator.abi,
    bytecode: PortalOrchestrator.bytecode,
    args: [],
  });
  const orchestratorReceipt = await client.waitForTransactionReceipt({
    hash: orchestratorHash,
  });
  if (!orchestratorReceipt.contractAddress)
    throw new Error("Orchestrator deployment failed");

  const orchestrator = client.getContract({
    address: orchestratorReceipt.contractAddress,
    abi: PortalOrchestrator.abi,
  })

  definitions.push({
    name: "PortalOrchestrator",
    abi: PortalOrchestrator.abi,
    address: orchestratorReceipt.contractAddress,
  });

  const iamAddress = await 
}

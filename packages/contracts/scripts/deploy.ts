import * as viem from "viem";
import { filecoinCalibration } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

import PortalOrchestrator from "../artifacts/contracts/PortalOrchestrator.sol/PortalOrchestrator.json";
import IAM from "../artifacts/contracts/IAM.sol/IAM.json";
import usdfc from "../artifacts/contracts/usdfc.sol/usdfc.json";
import SubHandler from "../artifacts/contracts/SubHandler.sol/SubHandler.json";
import KeyManager from "../artifacts/contracts/KeyManager.sol/KeyManager.json";

const primaryChain = filecoinCalibration;

if (!viem.isHex(Bun.env.PVT_KEY)) throw new Error("Pvt key mising");

const definitionsFile = Bun.file("./definitions.ts");
const definitions: Record<
  string,
  {
    abi: any;
    address: viem.Address;
  }
> = {};

const client = viem
  .createWalletClient({
    transport: viem.http(primaryChain.rpcUrls.default.http[0]),
    account: privateKeyToAccount(Bun.env.PVT_KEY),
    chain: primaryChain,
  })
  .extend(viem.publicActions);

async function main() {
  // if (!viem.isHex(usdfc.bytecode))
  //   throw new Error("usdfc bytecode is missing or invalid");

  // const usdfcHash = await client.deployContract({
  //   abi: usdfc.abi,
  //   bytecode: usdfc.bytecode,
  // });

  // const usdfcReceipt = await client.waitForTransactionReceipt({
  //   hash: usdfcHash,
  // });

  // if (!usdfcReceipt.contractAddress)
  //   throw new Error(
  //     "USDFC deployment failed \nDetails : " +
  //       "https://filecoin-testnet.blockscout.com/tx/" +
  //       usdfcReceipt.transactionHash
  //   );
  // const usdfcContract = viem.getContract({
  //   address: usdfcReceipt.contractAddress,
  //   abi: usdfc.abi,
  //   client,
  // });

  const usdfcAddress = "0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0";

  if (!viem.isHex(PortalOrchestrator.bytecode))
    throw new Error("PortalOrchestrator bytecode is missing or invalid");

  const orchestratorHash = await client.deployContract({
    abi: PortalOrchestrator.abi,
    bytecode: PortalOrchestrator.bytecode,
    args: [usdfcAddress],
    gas: 500_000_000n,
  });
  const orchestratorReceipt = await client.waitForTransactionReceipt({
    hash: orchestratorHash,
  });

  if (!orchestratorReceipt.contractAddress)
    throw new Error(
      "Orchestrator deployment failed \nDetails : " +
        "https://filecoin-testnet.blockscout.com/tx/" +
        orchestratorReceipt.transactionHash
    );

  const orchestrator = viem.getContract({
    address: orchestratorReceipt.contractAddress,
    abi: PortalOrchestrator.abi,
    client,
  });

  definitions["PortalOrchestrator"] = {
    abi: orchestrator.abi,
    address: orchestrator.address,
  };

  const iamAddress = await orchestrator.read.iam();
  if (typeof iamAddress != "string" || !viem.isAddress(iamAddress))
    throw new Error("IAM address not found");

  const iam = viem.getContract({
    address: iamAddress,
    abi: IAM.abi,
    client,
  });
  definitions["IAM"] = {
    abi: iam.abi,
    address: iam.address,
  };

  const subHandlerAddress = await orchestrator.read.subHandler();
  if (
    typeof subHandlerAddress != "string" ||
    !viem.isAddress(subHandlerAddress)
  )
    throw new Error("SubHandler address not found");
  const subHandler = viem.getContract({
    address: subHandlerAddress,
    abi: SubHandler.abi,
    client,
  });
  definitions["SubHandler"] = {
    abi: subHandler.abi,
    address: subHandler.address,
  };

  const keyManagerAddress = await orchestrator.read.keyManager();
  if (
    typeof keyManagerAddress != "string" ||
    !viem.isAddress(keyManagerAddress)
  )
    throw new Error("KeyManager address not found");
  const keyManager = viem.getContract({
    address: keyManagerAddress,
    abi: KeyManager.abi,
    client,
  });
  definitions["KeyManager"] = {
    abi: keyManager.abi,
    address: keyManager.address,
  };

  definitions["usdfc"] = {
    abi: usdfc.abi,
    address: usdfcAddress,
  };

  await Bun.write(
    definitionsFile,
    "const definitions = " +
      JSON.stringify(definitions, null, 2) +
      "as const;\nexport default definitions;\n"
  );
}

main()
  .then(() => {
    console.log("Deployment successful");
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });

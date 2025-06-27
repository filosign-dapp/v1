import { toast } from "sonner";
import { Button } from "@/src/lib/components/ui/button";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useSignMessage } from 'wagmi'
import { extractPrivateKeyFromSignature } from "@/src/lib/utils";
import Navbar from "@/src/lib/components/app/Navbar";
import useContracts from "@/src/lib/hooks/use-contracts";
import { createWalletClient, http, type TransactionReceipt } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { filecoinCalibration } from "viem/chains";
import { useState } from "react";

export default function Test() {
  const connectedAccount = useAccount();
  const { mutateAsync: mutateContractsAsync } = useContracts();
  const { signMessageAsync } = useSignMessage();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const { data: txReceipt, status, error } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  async function handleRegister() {
    try {
      if (!connectedAccount.address) {
        toast.error("Please connect your wallet");
        return;
      }

      const connectedAddress = connectedAccount.address;

      let isRegistered: boolean | undefined;
      // check connected wallet is already registered
      await mutateContractsAsync(async (contracts) => {
        isRegistered = await contracts.iam.read.registered([connectedAddress]);
      });

      if (isRegistered === undefined) throw new Error("Failed to check if connected wallet is registered");
      if (isRegistered) throw new Error("You are already registered");

      // determine next seed
      let nextSeed: `0x${string}` | undefined;
      await mutateContractsAsync(async (contracts) => {
        nextSeed = await contracts.iam.read.determineNextSeed();
      });

      if (nextSeed === undefined) throw new Error("Failed to determine next seed");

      // sign the seed with connected wallet
      const signature = await signMessageAsync({
        message: nextSeed,
      });

      // extract private key from signature
      const encryptionKey = extractPrivateKeyFromSignature(signature);
      console.log({ signature, encryptionKey, match: encryptionKey === nextSeed });

      // create wallet client
      const walletClient = createWalletClient({
        chain: filecoinCalibration,
        transport: http(),
        account: privateKeyToAccount(encryptionKey),
      });

      console.log(walletClient.account);

      // register
      let txHash: `0x${string}` | undefined;
      await mutateContractsAsync(async (contracts) => {
        txHash = await contracts.iam.write.register([connectedAddress, encryptionKey], {
          account: walletClient.account,
          chain: filecoinCalibration,
        });
      });
      setTxHash(txHash);
      return;
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col gap-4 items-center justify-center min-h-full bg-gradient-to-br from-background via-background/80 to-muted/20 px-[var(--paddingx)] h-screen">
        <Button onClick={handleRegister}>register</Button>
        <p className="text-sm text-muted-foreground">address: {connectedAccount.address}</p>

        {status === "success" && <p className="text-green-500">
          {JSON.stringify(txReceipt, null, 2)}
        </p>}
        {status === "error" && <p>error: {error.message}</p>}
        {error && <p>error: {error.message}</p>}
      </div>
    </div>
  );
}

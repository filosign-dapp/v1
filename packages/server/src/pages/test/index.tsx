import { toast } from "sonner";
import { Button } from "@/src/lib/components/ui/button";
import { useAccount, useWaitForTransactionReceipt } from "wagmi";
import { useSignMessage } from "wagmi";
import { extractPrivateKeyFromSignature } from "@/src/lib/utils";
import Navbar from "@/src/lib/components/app/Navbar";
import useContracts from "@/src/lib/hooks/use-contracts";
import {
  createWalletClient,
  encodePacked,
  http,
  keccak256,
  type TransactionReceipt,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { filecoinCalibration } from "viem/chains";
import { useState } from "react";

export default function Test() {
  const connectedAccount = useAccount();
  const { mutateAsync: mutateContractsAsync } = useContracts();
  const { signMessageAsync } = useSignMessage();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const {
    data: txReceipt,
    status,
    error,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  async function handleRegister() {
    await mutateContractsAsync(async (contracts) => {
      await contracts.register();
    });
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col gap-4 items-center justify-center min-h-full bg-gradient-to-br from-background via-background/80 to-muted/20 px-[var(--paddingx)] h-screen">
        <Button onClick={handleRegister}>register</Button>
        <p className="text-sm text-muted-foreground">
          address: {connectedAccount.address}
        </p>

        {status === "success" && (
          <p className="text-green-500">{JSON.stringify(txReceipt, null, 2)}</p>
        )}
        {status === "error" && <p>error: {error.message}</p>}
        {error && <p>error: {error.message}</p>}
      </div>
    </div>
  );
}

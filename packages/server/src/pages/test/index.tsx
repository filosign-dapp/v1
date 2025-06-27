import { toast } from "sonner";
import { Button } from "@/src/lib/components/ui/button";
import { useAccount } from "wagmi";
import { useSignMessage } from 'wagmi'
import { extractPrivateKeyFromSignature } from "@/src/lib/utils";
import Navbar from "@/src/lib/components/app/Navbar";
import useContracts from "@/src/lib/hooks/use-contracts";
import { filecoin } from "viem/chains";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export default function Test() {
  const connectedAccount = useAccount();
  const { mutateAsync: mutateContractsAsync } = useContracts();
  const { signMessageAsync } = useSignMessage();

 

  async function handleRegister() {
    try {
      if (!connectedAccount.address) {
        toast.error("Please connect your wallet");
        return;
      }

      const connectedAddress = connectedAccount.address;

      // check connected wallet is already registered
      const isRegistered = await mutateContractsAsync(async (contracts) => {
        const isRegistered = await contracts.iam.read.registered([connectedAddress]);
        console.log(isRegistered);
      });

      // determine next seed
      const nextSeed = await mutateContractsAsync(async (contracts) => {
        const nextSeed = await contracts.iam.read.determineNextSeed();
        console.log(nextSeed);
      });

      // sign the seed with connected wallet
      const signature = await signMessageAsync({
        message: `${nextSeed}`,
      });
      console.log(signature);

      // extract private key from signature
      const encryptionKey = extractPrivateKeyFromSignature(signature);
      console.log(encryptionKey);

      // create wallet client
      const walletClient = createWalletClient({
        chain: filecoin,
        transport: http(),
        account: privateKeyToAccount(encryptionKey),
      });

      // register
      const tx = await mutateContractsAsync(async (contracts) => {
        const tx = await contracts.iam.write.register([connectedAddress, encryptionKey], {
          account: walletClient.account,
          chain: filecoin,
        });
        console.log(tx);
      });

      return;
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col gap-4 items-center justify-center min-h-full bg-gradient-to-br from-background via-background/80 to-muted/20 px-[var(--paddingx)] h-screen">
        <Button onClick={handleRegister}>register</Button>
        <p className="text-sm text-muted-foreground">address: {connectedAccount.address}</p>
      </div>
    </div>
  );
}

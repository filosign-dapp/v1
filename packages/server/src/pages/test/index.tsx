import { Button } from "@/src/lib/components/ui/button";
import { Input } from "@/src/lib/components/ui/input";
import useContracts from "@/src/lib/hooks/use-contracts";
import { useAccount } from "wagmi";
import { useSignTypedData } from "wagmi";
import { toast } from "sonner";
import Navbar from "@/src/lib/components/app/Navbar";
import { useState } from "react";

export default function Test() {
  const { mutate } = useContracts();
  const account = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const [privateKey, setPrivateKey] = useState<`0x${string}` | null>(null);

  async function handleClick() {
    if (!account.address) {
      toast.error("Please connect your wallet");
      return;
    }

    const address = account.address;

    mutate(async (contracts) => {
      const result = await contracts.iam.read.determineNextSeed();
      console.log("asdad ", result);
      setPrivateKey(result);
    });

    return;

    const message = "register";
    const signature = await signTypedDataAsync({
      primaryType: "Message",
      domain: {
        name: "Portal",
        version: "1",
        chainId: 1,
      },
      types: {
        Message: [{ name: "message", type: "string" }],
      },
      message: { message },
    });

    console.log({ address, signature });

    contracts.mutate(async (contracts) => {
      const tx = await contracts.iam.write.register([address, signature]);
    });
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col gap-4 items-center justify-center min-h-full bg-gradient-to-br from-background via-background/80 to-muted/20 px-[var(--paddingx)] h-screen">
        <p className="text-sm text-muted-foreground">{account.address}</p>

        <Button onClick={handleClick}>register</Button>

        <div className="text-sm text-muted-foreground">
          <div className="text-sm text-muted-foreground">nothing</div>
        </div>
      </div>
    </div>
  );
}

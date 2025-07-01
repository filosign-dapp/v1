import { Button } from "@/src/lib/components/ui/button";
import { useAccount } from "wagmi";
import Navbar from "@/src/lib/components/app/Navbar";
import useContracts from "@/src/lib/hooks/use-contracts";
import { toast } from "sonner";

export default function Test() {
  const connectedAccount = useAccount();
  const { mutateAsync: mutateContractsAsync } = useContracts().mutate;

  async function handleRegister() {
    try {
      let isRegistered = false;
      await mutateContractsAsync(async (contracts) => {
        isRegistered = await contracts.isRegistered();
      });

      if (isRegistered) {
        toast.warning("You are already registered");
        return;
      }

      await mutateContractsAsync(async (contracts) => {
        await contracts.register();
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function handlePublishEncryptedKeys() {
    try {
      await mutateContractsAsync(async (contracts) => {
        const tx = await contracts.publishEncryptedKeys({
          cid: "bafkreihl6eos6cyvfltwmu2jof4sqfkpmlra5uqm6wcihz66z6smubdkhu",
          msg: "slc+xK7ylDJFe68PKLXSnsDCq7Y1mplYM6daF3vWDso=:D5AlDffQIHaNVvvG",
          recipients: ["0x5D56b71abE6cA1Dc208Ed85926178f9758fa879c"],
          safe: false,
        });

        console.log(tx);
      });
    } catch (error) {
      console.log(error);
    }
  }

  async function handleDownload() {
    try {
      await mutateContractsAsync(async (contracts) => {
        const key = await contracts.getKeyForFile("bafkreihl6eos6cyvfltwmu2jof4sqfkpmlra5uqm6wcihz66z6smubdkhu");
        console.log(key);
      });
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <Navbar />
      <div className="flex flex-col gap-4 items-center justify-center min-h-full bg-gradient-to-br from-background via-background/80 to-muted/20 px-[var(--paddingx)] h-screen">
        <Button onClick={handleRegister}>register</Button>
        <Button onClick={handlePublishEncryptedKeys}>publish encrypted keys</Button>
        <Button onClick={handleDownload}>download</Button>
        <p className="text-sm text-muted-foreground">
          address: {connectedAccount.address}
        </p>
      </div>
    </div>
  );
}

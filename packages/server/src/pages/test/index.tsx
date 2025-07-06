import { Button } from "@/src/lib/components/ui/button";
import { useAccount, useBalance } from "wagmi";
import Navbar from "@/src/lib/components/app/Navbar";
import useContracts from "@/src/lib/hooks/use-contracts";
import { toast } from "sonner";
import { formatEther } from "viem";
import { useEffect, useState } from "react";

export default function Test() {
  const connectedAccount = useAccount();
  const { mutateAsync: mutateContractsAsync } = useContracts().mutate;
  const [usdfcBalance, setUsdfcBalance] = useState<bigint>(0n);
  const { data: balanceData } = useBalance({
    address: connectedAccount.address,
    token: "0xb3042734b608a1B16e9e86B374A3f3e389B4cDf0",
  });

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

  async function readValues() {
    await mutateContractsAsync(async (contracts) => {
      if (!connectedAccount.address) {
        toast.error("No account connected");
        return;
      }
      const value = await contracts.usdfc.read.balanceOf([connectedAccount.address]);
      setUsdfcBalance(value);
    });
  }

  useEffect(() => {
    readValues();
  }, [connectedAccount.address, useContracts().ready]);

  return (
    <div>
      <Navbar />
      <div className="flex flex-col gap-4 items-center justify-center min-h-full bg-gradient-to-br from-background via-background/80 to-muted/20 px-[var(--paddingx)] h-screen">
        <Button onClick={handleRegister}>register</Button>
        <Button onClick={handlePublishEncryptedKeys}>publish encrypted keys</Button>
        <Button onClick={handleDownload}>download</Button>
        <p className="text-sm text-muted-foreground">
          address: {connectedAccount.address}
          <br />
          usdfc from contract: {formatEther(usdfcBalance)}
          <br />
          usdfc from wagmi: {formatEther(balanceData?.value ?? 0n)}
        </p>
      </div>
    </div>
  );
}

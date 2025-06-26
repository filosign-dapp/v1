import { Button } from "@/src/lib/components/ui/button";
import useContracts from "@/src/lib/hooks/use-contracts";

export default function Test() {
  const contracts = useContracts();

  async function handleClick() {
    contracts.mutate(async (contracts) => {
        const tx = await contracts.iam.write.register([
            address,
            signature
        ]);
        console.log(tx)
    })
  }

  return <div className="flex flex-col gap-4 items-center justify-center min-h-full bg-gradient-to-br from-background via-background/80 to-muted/20 px-[var(--paddingx)] h-screen">
    <Button onClick={handleClick}>
        do something
    </Button>

    <div className="text-sm text-muted-foreground">
        <div className="text-sm text-muted-foreground">
            nothing
        </div>
    </div>
  </div>;
}
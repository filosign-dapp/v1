import { toast } from "sonner";
import useContracts from "../../hooks/use-contracts";
import { useUserStore } from "../../hooks/use-store";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import Icon from "../custom/Icon";
import { usePrivy } from "@privy-io/react-auth";
import PremiumSheet from "./PremiumSheet";

export default function Pro() {
    const { mutate: mutateContracts, ready: readyContracts } = useContracts();
    const { isRegistered, setIsRegistered } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const { ready, authenticated } = usePrivy();

    async function checkIsRegistered() {
        try {
            if (!readyContracts) return false;
            setIsLoading(true);

            let isRegistered = false;
            await mutateContracts.mutateAsync(async (contracts) => {
                isRegistered = await contracts.isRegistered();
                setIsRegistered(isRegistered);
            });

            return isRegistered;
        } catch (err) {
            console.log("failed to call isRegistered");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleRegister() {
        await mutateContracts.mutateAsync(async (contracts) => {
            await contracts.register();
        });
    }

    const handleButtonClick = () => {
        if (isRegistered) {
            return;
        }
        setIsSheetOpen(true);
    };

    useEffect(() => {
        if (!authenticated) {
            setIsRegistered(false);
        }

        if (readyContracts && authenticated) {
            checkIsRegistered();
        }
    }, [readyContracts, authenticated]);

    if (!ready || !authenticated || !readyContracts || isLoading) return null;

    return (
        <PremiumSheet
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            onRegister={handleRegister}
        >
            {!isRegistered && (
                <Button 
                    onClick={handleButtonClick} 
                    className="bg-neo-purple border-4 border-black text-zinc-950 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase text-sm hover:bg-white rounded-none px-3 py-2"
                >
                    <span className="font-black">Get Premium</span>
                </Button>
            )}
        </PremiumSheet>
    );
}
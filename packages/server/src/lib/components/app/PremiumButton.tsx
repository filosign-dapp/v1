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

    if (!ready || !authenticated) return null;

    if (!readyContracts || isLoading) return (
        <Button disabled className="px-3 py-5">
            <Skeleton className="w-24 h-2" />
        </Button>
    );

    return (
        <PremiumSheet
            isOpen={isSheetOpen}
            onOpenChange={setIsSheetOpen}
            onRegister={handleRegister}
        >
            <Button onClick={handleButtonClick} variant="outline" className="px-3 py-5">
                <span className="">
                    {isRegistered ? (
                        <div className="flex items-center gap-2">
                            <p className="font-semibold">Premium</p>
                            <Icon name="Sparkles" className="size-4 text-primary" />
                        </div>
                    ) : (
                        <p className="text-primary font-semibold">Get Premium</p>
                    )}
                </span>
            </Button>
        </PremiumSheet>
    );
}
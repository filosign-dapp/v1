import useContracts from "../../hooks/use-contracts";
import { useUserStore } from "../../hooks/use-store";
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
                <div>
                    <Button
                        onClick={handleButtonClick}
                        variant={"neo"}
                        className="flex rounded-sm bg-white hover:bg-white"
                    >
                        <span className="font-semibold bg-gradient-to-r from-blue-600 via-orange-500 to-red-500 bg-clip-text text-transparent">Get Pro</span>

                        <Icon name="Zap" className="size-4 text-red-500" />
                    </Button>
                </div>
            )}
        </PremiumSheet>
    );
}
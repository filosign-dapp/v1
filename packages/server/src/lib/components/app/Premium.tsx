import { toast } from "sonner";
import useContracts from "../../hooks/use-contracts";
import { useUserStore } from "../../hooks/use-store";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import Icon from "../custom/Icon";
import { usePrivy } from "@privy-io/react-auth";

export default function Pro() {
    const { mutate: mutateContracts, ready: readyContracts } = useContracts();
    const { isRegistered, setIsRegistered } = useUserStore();
    const [isLoading, setIsLoading] = useState(false);
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

            console.log("called isRegistered successfully");
            return isRegistered;
        } catch (err) {
            console.log("failed to call isRegistered");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleRegister() {
        try {
            if (await checkIsRegistered()) {
                toast.warning("You are already registered");
                return;
            }

            await mutateContracts.mutateAsync(async (contracts) => {
                await contracts.register();
            });
        } catch (error) {
            console.log(error);
        }
    }

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
        <div>
            <Button onClick={handleRegister} variant="outline" className="px-3 py-5">
                <span className="">
                    {isRegistered ?
                        <div className="flex items-center gap-2">
                            <p className="bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent font-semibold">Premium</p>
                            <Icon name="Sparkles" className="size-4 text-red-400" />
                        </div> :
                        <p className="bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 bg-clip-text text-transparent font-semibold">Get Premium</p>
                    }
                </span>
            </Button>
        </div>
    );
}
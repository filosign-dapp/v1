import { usePrivy } from "@privy-io/react-auth";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { truncateAddress } from "../../utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import Icon from "../custom/Icon";
import { Link } from "@tanstack/react-router";
import PremiumButton from "./PremiumButton";
import FaucetSheet from "./FaucetDialog";
import { useState } from "react";

interface ConnectProps {
    isMobile?: boolean;
}

export default function Connect({ isMobile = false }: ConnectProps) {
    const { ready, authenticated, user, login, logout } = usePrivy();
    const [showFaucet, setShowFaucet] = useState(false);

    if (!ready) return (
        <Button disabled variant="neo" className="rounded-sm">
            <Skeleton className="w-24 h-2 bg-neo-beige-1-dark" />
        </Button>
    );

    if (!authenticated) return (
        <Button
            onClick={() => login()}
            variant="neo"
            className="py-1 px-5 rounded-sm"
        >
            Connect Wallet
        </Button>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="neo" className="rounded-sm">
                    <Avatar className="size-6">
                        <AvatarImage src={localStorage.getItem(`profile_image_${user?.id}`) || undefined} className="object-cover" />
                        <AvatarFallback className="text-xs font-black bg-neo-yellow-1 border border-black">
                            {user?.wallet?.address?.slice(0, 1)?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-zinc-950 text-xs">{truncateAddress(user?.wallet?.address ?? "")}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-2 w-48 bg-neo-bg border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none">
                <DropdownMenuLabel className="font-black uppercase text-zinc-900">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-black h-[2px]" />

                {/* Mobile-only menu items */}
                {isMobile && (
                    <>
                        <div className="p-2 flex items-center gap-2">
                            <PremiumButton />
                            <FaucetSheet isOpen={showFaucet} onOpenChange={setShowFaucet}>
                                <Button variant={"neo"} className="rounded-sm">
                                    <Icon name="Droplets" className="w-4 h-4 lg:w-5 lg:h-5" />
                                </Button>
                            </FaucetSheet>
                        </div>
                        <DropdownMenuSeparator className="bg-black h-[2px]" />
                        <DropdownMenuItem asChild>
                            <Link to="/shared" className="flex items-center cursor-pointer font-bold text-zinc-800 hover:bg-neo-beige-1 hover:text-zinc-950">
                                <Icon name="FileSpreadsheet" className="mr-2 w-4 h-4" />
                                Shared
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to="/history" className="flex items-center cursor-pointer font-bold text-zinc-800 hover:bg-neo-beige-1 hover:text-zinc-950">
                                <Icon name="History" className="mr-2 w-4 h-4" />
                                History
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-black h-[2px]" />
                    </>
                )}

                <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer font-bold text-zinc-800 hover:bg-neo-beige-1 hover:text-zinc-950">
                        <Icon name="User" className="mr-2 w-4 h-4" />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                    logout();
                }} className="font-bold text-zinc-800 hover:bg-neo-beige-1 hover:text-zinc-950">
                    <Icon name="LogOut" className="mr-2 w-4 h-4" />
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
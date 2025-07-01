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

export default function Connect() {
    const { ready, authenticated, user, login, logout } = usePrivy();

    if (!ready) return (
        <Button disabled className="px-3 py-5">
            <Skeleton className="w-24 h-2" />
        </Button>
    );

    if (!authenticated) return (
        <Button onClick={() => login()} className="px-3 py-5">
            Connect Wallet
        </Button>
    );

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <div className="flex gap-2 justify-center items-center py-1 w-36 text-sm rounded-sm border hover:bg-accent/30">
                    <Avatar className="size-8">
                        <AvatarImage src={localStorage.getItem(`profile_image_${user?.id}`) || undefined} className="object-cover" />
                        <AvatarFallback className="text-2xl">
                            {user?.wallet?.address?.slice(0, 1)?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <span>{truncateAddress(user?.wallet?.address ?? "")}</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mt-1 w-48">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center cursor-pointer">
                        <Icon name="User" className="mr-2 w-4 h-4" />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                    <Icon name="CreditCard" className="mr-2 w-4 h-4" />
                    Billing
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                    logout();
                }}>
                    <Icon name="LogOut" className="mr-2 w-4 h-4" />
                    Disconnect
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
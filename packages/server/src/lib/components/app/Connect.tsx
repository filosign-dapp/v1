import { usePrivy } from "@privy-io/react-auth";
import { Skeleton } from "../ui/skeleton";
import { Button } from "../ui/button";
import Icon from "../custom/Icon";

export default function Connect() {
    const { ready, authenticated, user, login, logout } = usePrivy();

    if (!ready) return (
        <Button disabled>
            <Skeleton className="w-24 h-2" />
        </Button>
    );

    if (!authenticated) return (
        <Button onClick={() => login()}>
            Connect Wallet
        </Button>
    );

    return (
        <Button onClick={() => logout()}>
            <Icon name="LogOut" className="w-4 h-4" />
            Disconnect
        </Button>
    );
}
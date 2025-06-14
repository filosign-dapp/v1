import { usePrivy } from "@privy-io/react-auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { truncateText } from "../../utils";

export default function Profile() {
    const { user } = usePrivy();

    return (
        <div className="flex items-center gap-2">
            <Avatar>
                <AvatarFallback>
                    {truncateText(user?.wallet?.address ?? "", 4)}
                </AvatarFallback>
            </Avatar>
        </div>
    );
}
import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';
import { useTheme } from './theme-provider';

export default function PrivyProvider({ children }: { children: React.ReactNode }) {
    const {theme} = useTheme();
    return (
        <PrivyProviderBase
            appId={process.env.BUN_PUBLIC_PRIVY_APP_ID!}
            config={{
                loginMethods: ["email", "wallet", "google"],
                embeddedWallets: {
                    ethereum: {
                        createOnLogin: "users-without-wallets",
                    },
                },
                appearance: {
                    theme: theme === "dark" ? "dark" : "light",
                }
            }}
        >
            {children}
        </PrivyProviderBase>
    )
}
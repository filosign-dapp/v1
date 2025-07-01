import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';

export function PrivyProvider({ children }: { children: React.ReactNode }) {
    return (
        <PrivyProviderBase
            appId={process.env.BUN_PUBLIC_PRIVY_APP_ID!}
            config={{
                loginMethods: ["wallet"],
                appearance: {
                    theme: "light",
                    landingHeader: "Sign in to Portal"
                }
            }}
        >
            {children}
        </PrivyProviderBase>
    )
}
import { http } from 'wagmi'
import { optimism, optimismSepolia } from 'wagmi/chains'
import { createConfig, WagmiProvider as WagmiProviderBase } from '@privy-io/wagmi'

declare module 'wagmi' {
    interface Register {
        config: typeof config
    }
}

const config = createConfig({
    chains: [optimism, optimismSepolia],
    transports: {
        [optimism.id]: http(),
        [optimismSepolia.id]: http(),
    },
})

export function WagmiProvider({ children }: { children: React.ReactNode }) {
    return <WagmiProviderBase config={config}>{children}</WagmiProviderBase>
}
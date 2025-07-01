import { http } from "wagmi";
import { filecoinCalibration } from "viem/chains";
import {
  createConfig,
  WagmiProvider as WagmiProviderBase,
} from "@privy-io/wagmi";

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

export const config = createConfig({
  chains: [filecoinCalibration],
  transports: {
    [filecoinCalibration.id]: http(),
  },
});

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <WagmiProviderBase config={config}>{children}</WagmiProviderBase>;
}

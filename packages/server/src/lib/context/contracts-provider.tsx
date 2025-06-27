import React, { useContext, useEffect, useRef, useState } from "react";
import { Contracts } from "contracts";
import { useWalletClient } from "wagmi";

type Status =
  | "disconnected"
  | "idle"
  | "unsupported-chain"
  | "initializing"
  | "pending"
  | "panic";
interface Web3ContextType {
  //   contracts: Contracts | null;
  ready: boolean;
  status: Status;
  act: <T>(fn: (contracts: Contracts) => Promise<T>) => Promise<T>;
}

const Web3Context = React.createContext<Web3ContextType>({
  //   contracts: null,
  status: "disconnected",
  ready: false,
  act: async (fn) => {
    console.warn("Web3Context not initialized yet, cannot perform action");
    return Promise.resolve({} as any);
  },
});

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const flag = useRef("");
  const [contracts, setContracts] = useState<Contracts | null>(null);
  const { data: walletClient } = useWalletClient();
  const [status, setStatus] = useState<Status>("disconnected");

  useEffect(() => {
    if (JSON.stringify(walletClient) != flag.current) {
      flag.current = JSON.stringify(walletClient);

      if (walletClient) {
        setStatus("initializing");
        (async () => {
          const instance = new Contracts(walletClient);
          setContracts(instance);
        })()
          .then(() => setStatus("idle"))
          .catch(() => {
            setStatus("panic");
            alert("");
          });
      } else {
        setStatus("disconnected");
        setContracts(null);
      }
    }
  });

  useEffect(() => {
    if (walletClient?.chain.id != Contracts.chain.id) {
      setStatus("unsupported-chain");
      setContracts(null);
    } else {
      setStatus("idle");
    }
  }, [walletClient, contracts]);

  async function act<T>(fn: (contracts: Contracts) => Promise<T>) {
    return new Promise<T>((resolve, reject) => {
      if (!contracts) {
        console.warn("Web3Context not initialized yet, cannot perform action");
        return reject(new Error("Web3Context not initialized"));
      }

      setStatus("pending");

      fn(contracts)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.error("Error in Web3Context action:", error);
          //   setStatus("panic");
          reject();
        })
        .finally(() => {
          setStatus("idle");
        });
    });
  }

  const value: Web3ContextType = {
    // contracts: contracts,
    status,
    act,
    ready: !!contracts && walletClient?.chain.id == Contracts.chain.id,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}

export default function useWeb3() {
  return useContext(Web3Context);
}

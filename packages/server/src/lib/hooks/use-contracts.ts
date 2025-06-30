import useWeb3 from "../context/contracts-provider";
import { useMutation } from "@tanstack/react-query";
import { useSwitchChain } from "wagmi";
import { Contracts } from "contracts";

export default function () {
  const { act, ready, status } = useWeb3();
  const { switchChain } = useSwitchChain();
  return useMutation({
    mutationFn: async (fn: Parameters<typeof act>[0]) => {
      if (!ready) {
        console.error("ugh");
        throw new Error("ugh");
      }

      if (status === "disconnected") {
        console.error("Please connect your wallet to continue.");
        throw new Error("Please connect your wallet to continue.");
      }
      if (status === "unsupported-chain") {
        console.error("Unsupported chain. Please switch to the correct network.");
        throw new Error("Unsupported chain. Please switch to the correct network.");
      }
      if (status === "panic") {
        console.error("An error occurred. Please reload the page and try again later.");
        throw new Error("An error occurred. Please reload the page and try again later.");
      }

      return act(fn);
    },
    onError: (error) => {
      console.error("Error in useContracts mutation:", error);
      console.error("An error occurred while processing your request on chain.");
    },
    onSuccess: () => {
      console.log("Transaction successful!");
    },
  });
}

import useWeb3 from "../context/contracts-provider";
import { useMutation } from "@tanstack/react-query";
import { useSwitchChain } from "wagmi";
import { Contracts } from "contracts";
import { toast } from "sonner";

export default function () {
  const { act, ready, status } = useWeb3();
  const { switchChain } = useSwitchChain();
  return useMutation({
    mutationFn: async (fn: Parameters<typeof act>[0]) => {
      if (!ready) {
        toast.error("Web3 client not ready");
        return;
      }

      if (status === "disconnected") {
        toast.error("Please connect your wallet to continue.");
        return;
      }

      if (status === "unsupported-chain") {
        toast.error("Unsupported chain. Please switch to the correct network.");
        return;
      }

      if (status === "panic") {
        toast.error("An error occurred. Please reload the page and try again later.");
        return;
      }

      return act(fn);
    },
    onError: (error) => {
      console.error("Error in useContracts mutation:", error);
      toast.error("An error occurred while processing your request on chain.");
    },
    onSuccess: () => {
      toast.success("Transaction submitted successfully!");
    },
  });
}

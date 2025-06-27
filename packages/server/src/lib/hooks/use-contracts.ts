import { toast } from "sonner";
import useWeb3 from "../context/contracts-provider";
import { useMutation } from "@tanstack/react-query";
import { useSwitchChain } from "wagmi";
import { Contracts } from "contracts";

export default function () {
  const { act, ready, status } = useWeb3();
  const { switchChain } = useSwitchChain();
  return useMutation({
    mutationFn: async (fn: Parameters<typeof act>[0]) => {
      if (!ready) throw toast.error("ugh");

      if (status === "disconnected")
        throw toast.error("Please connect your wallet to continue.");
      if (status === "unsupported-chain")
        throw toast.error(
          "Unsupported chain. Please switch to the correct network.",
          {
            action: {
              label: "Switch",
              onClick: () => {
                switchChain({ chainId: Contracts.chain.id });
              },
            },
          }
        );
      if (status === "panic")
        throw toast.error(
          "An error occurred. Please reload the page and try again later.",
          {
            action: {
              label: "Reload",
              onClick: () => {
                window.location.reload();
              },
            },
          }
        );

      return act(fn);
    },
    onError: (error) => {
      console.error("Error in useContracts mutation:", error);
      toast.error("An error occurred while processing your request on chain.");
    },
    onSuccess: () => {
      toast.success("Operation completed successfully!");
    },
  });
}

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { DialogTrigger } from "../ui/dialog";
import Icon from "../custom/Icon";
import { usePrivy } from "@privy-io/react-auth";
import { useState } from "react";
import { truncateAddress, truncateText } from "../../utils";

export default function FaucetDialog() {
    const { authenticated, user } = usePrivy();
    const [copiedAddress, setCopiedAddress] = useState(false);
    
    if (!authenticated) return null;

    // Get the wallet address from the user's embedded wallet or connected wallet
    const walletAddress = user?.wallet?.address || user?.linkedAccounts?.find(account => account.type === 'wallet')?.address;

    const copyAddressToClipboard = async () => {
        if (!walletAddress) return;
        
        try {
            await navigator.clipboard.writeText(walletAddress);
            setCopiedAddress(true);
            setTimeout(() => setCopiedAddress(false), 2000);
        } catch (err) {
            console.error('Failed to copy address:', err);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant={"neo"} className="rounded-sm">
                    <Icon name="Droplets" className="w-4 h-4 lg:w-5 lg:h-5" />
                </Button>
            </DialogTrigger>

            <DialogContent className="bg-neo-beige-2 border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg max-w-md">
                <DialogHeader className="space-y-4">
                    {/* Icon Header */}
                    <div className="w-16 h-16 mx-auto bg-neo-beige-1 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center">
                        <Icon name="Droplets" className="w-8 h-8 text-zinc-900" />
                    </div>
                    
                    <DialogTitle className="text-2xl font-bold tracking-tight uppercase text-center text-zinc-900">
                        Get Testnet Tokens
                    </DialogTitle>
                    
                    <DialogDescription className="text-center font-medium text-zinc-700 px-2">
                        Get testnet tokens for testing on Calibration Network. Choose your token type below.
                    </DialogDescription>
                </DialogHeader>

                {/* Wallet Address Section */}
                {walletAddress && (
                    <div className="mt-6 p-4 bg-neo-beige-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-sm">
                        <div className="space-y-3">
                            <p className="text-xs font-bold uppercase text-zinc-800 text-center">Your Wallet Address:</p>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 p-2 bg-white border-2 border-black rounded-sm text-xs text-shadow-xs text-zinc-900 break-all">
                                    <span className="hidden sm:inline">{walletAddress}</span>
                                    <span className="sm:hidden">{truncateText(walletAddress, 42)}</span>
                                </div>
                                <Button
                                    variant="neo"
                                    size="sm"
                                    onClick={copyAddressToClipboard}
                                    className="h-8 px-3 bg-neo-cyan border-2 border-black font-bold text-zinc-900"
                                    title={copiedAddress ? 'Copied!' : 'Copy Address'}
                                >
                                    {copiedAddress ? (
                                        <Icon name="Check" className="w-4 h-4" />
                                    ) : (
                                        <Icon name="Copy" className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex flex-col gap-4 mt-6">
                    {/* TFIL Token */}
                    <a href="https://faucet.calibnet.chainsafe-fil.io/funds.html" target="_blank" rel="noopener noreferrer">
                        <Button variant={"neo"} className="w-full h-12 bg-neo-yellow-1 border-2 border-black rounded-sm font-bold uppercase tracking-wide text-zinc-900  transition-all">
                            <Icon name="Coins" className="w-5 h-5" />
                            <span className="ml-2">Get TFIL Tokens</span>
                            <Icon name="ExternalLink" className="w-4 h-4 ml-auto opacity-70" />
                        </Button>   
                    </a>

                    {/* TUSDFC Token */}
                    <a href="https://forest-explorer.chainsafe.dev/faucet/calibnet_usdfc" target="_blank" rel="noopener noreferrer">
                        <Button variant={"neo"} className="w-full h-12 bg-neo-indigo border-2 border-black rounded-sm font-bold uppercase tracking-wide text-zinc-900  transition-all">
                            <Icon name="DollarSign" className="w-5 h-5" />
                            <span className="ml-2">Get TUSDFC Tokens</span>
                            <Icon name="ExternalLink" className="w-4 h-4 ml-auto opacity-70" />
                        </Button>
                    </a>
                </div>

                {/* Info Section */}
                <div className="mt-6 p-4 bg-neo-beige-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-sm">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-amber-200 border border-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Icon name="Info" className="w-3 h-3 text-amber-800" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase text-zinc-800">Important:</p>
                            <p className="text-xs font-medium text-zinc-700 leading-relaxed">
                                These are testnet tokens with no real value. Use them only for testing purposes on the Calibration Network.
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
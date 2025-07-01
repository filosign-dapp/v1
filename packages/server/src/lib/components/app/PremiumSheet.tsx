import { useState } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "../ui/sheet";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import Icon from "../custom/Icon";
import { cn } from "../../utils";
import { useUserStore } from "../../hooks/use-store";

interface PremiumSheetProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onRegister: () => Promise<void>;
    children: React.ReactNode;
}

export default function PremiumSheet({ isOpen, onOpenChange, onRegister, children }: PremiumSheetProps) {
    const [isRegistering, setIsRegistering] = useState(false);
    const { isRegistered } = useUserStore();

    const handleRegister = async () => {
        try {
            setIsRegistering(true);
            await onRegister();
            onOpenChange(false);
            toast(
                <div>
                    <div className="font-bold text-lg mb-1 flex items-center gap-2">
                        <Icon name="Sparkles" className="size-5 text-primary" />
                        Request Submitted!
                    </div>
                    <div className="text-muted-foreground text-sm">
                        Your premium status will be updated soon. Please don't submit another request while your wallet is processing the transaction.
                    </div>
                </div>,
                {
                    duration: 4000,
                    className: "bg-background border border-primary shadow-lg"
                }
            );
        } catch (error) {
            console.log(error);
            toast.error("Registration failed. Please try again.");
        } finally {
            setIsRegistering(false);
        }
    };

    const premiumFeatures = [
        {
            icon: "Shield",
            title: "Wallet-specific access control",
            description: isRegistered 
                ? "You can restrict file access to specific wallet addresses"
                : "Only specified wallet addresses can access your files"
        },
        {
            icon: "CreditCard",
            title: "Monetized links with paywalls",
            description: isRegistered
                ? "You can set payment requirements for file downloads"
                : "Set payment requirements for file downloads"
        },
        {
            icon: "HardDrive",
            title: "Permanent Filecoin storage deals",
            description: isRegistered
                ? "Your files are stored permanently on the decentralized network"
                : "Your files stored permanently on the decentralized network"
        },
        {
            icon: "Clock",
            title: "Smart contract enforced expiry",
            description: isRegistered
                ? "You have automated file expiration with blockchain guarantees"
                : "Automated file expiration with blockchain guarantees"
        }
    ];

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            
            <SheetContent className="sm:max-w-md w-full bg-neo-bg overflow-y-auto p-0">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="p-6"
                >
                    <SheetHeader className="text-center space-y-4">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className={cn(
                                "mx-auto w-16 h-16 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center",
                                isRegistered ? "bg-neo-yellow-1" : "bg-neo-indigo"
                            )}
                        >
                            <Icon name="Sparkles" className="size-8 text-zinc-950" />
                        </motion.div>
                        
                        <div>
                            <SheetTitle className="text-2xl font-bold text-zinc-900">
                                {isRegistered ? "Premium Active" : "Unlock Premium"}
                            </SheetTitle>
                            <SheetDescription className="text-base mt-2 text-zinc-600 font-medium">
                                {isRegistered 
                                    ? "You have access to all premium Web3 features powered by smart contracts"
                                    : "Get access to powerful Web3 features powered by smart contracts"
                                }
                            </SheetDescription>
                        </div>
                    </SheetHeader>

                    <Card className="p-6 bg-neo-beige-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg mt-6">
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-center uppercase tracking-wide text-zinc-900">
                                {isRegistered ? "Your Premium Features" : "Premium Features"}
                            </h3>
                            
                            <div className="space-y-4">
                                {premiumFeatures.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                                        className={cn(
                                            "flex items-start gap-4 p-4 rounded-lg transition-all duration-150",
                                            "bg-neo-beige-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px]"
                                        )}
                                    >
                                        <div className="flex-shrink-0 w-10 h-10 bg-neo-purple border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg flex items-center justify-center">
                                            <Icon name={feature.icon as any} className="size-5 text-zinc-950" />
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-semibold text-sm text-zinc-900">{feature.title}</h4>
                                            <p className="text-sm text-zinc-600 leading-relaxed">
                                                {feature.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </Card>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 }}
                        className="space-y-4 mt-8"
                    >
                        {isRegistered ? (
                            <div className="p-4 bg-neo-green border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg text-center">
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <Icon name="CircleCheck" className="size-5 text-zinc-950" />
                                    <span className="text-sm font-bold text-zinc-950 uppercase tracking-wide">
                                        Premium Active
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-800 font-medium">
                                    All features above are active and ready to use!
                                </p>
                            </div>
                        ) : (
                            <Button
                                onClick={handleRegister}
                                disabled={isRegistering}
                                variant="neo"
                                className="w-full bg-neo-yellow-1 border-2 border-black text-zinc-950 font-bold py-6 text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all duration-150 uppercase tracking-wide hover:bg-white rounded-lg"
                                size="lg"
                            >
                                {isRegistering ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Registering...
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Icon name="Zap" className="size-5" />
                                        Continue to Premium
                                    </div>
                                )}
                            </Button>
                        )}

                        <div className="flex items-center justify-center gap-2 text-sm text-zinc-600 font-medium">
                            <Icon name="Lock" className="size-4" />
                            <span>Filecoin Calibration Network</span>
                        </div>
                    </motion.div>
                </motion.div>
            </SheetContent>
        </Sheet>
    );
} 
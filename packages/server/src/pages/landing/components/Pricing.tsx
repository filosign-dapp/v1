import { Button } from "@/src/lib/components/ui/button";
import { ArrowRight, Wallet } from "lucide-react";
import { motion } from "motion/react";

const TwoTierModel = () => {
  return (
    <section id="tiers" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-neo-beige-1 border-t-4 border-black min-h-screen flex items-center dotted-pattern relative overflow-hidden">
      {/* Floating pricing shapes - variety */}
      <motion.div 
        className="absolute top-20 left-8 w-8 h-8 bg-neo-purple border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-full"
        animate={{ 
          y: [0, -15, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <motion.div 
          className="text-center mb-12 sm:mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="inline-block mb-14"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <span className="bg-neo-purple text-zinc-950 px-4 sm:px-6 py-2 sm:py-3 font-black text-sm sm:text-base uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              🚀 PICK YOUR POISON
            </span>
          </motion.div>
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-zinc-900 mb-6 sm:mb-8 leading-none tracking-tighter uppercase"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            FREE FOREVER
            <br />
            <motion.span 
              className="text-neo-indigo-dark"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              OR GO PRO
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl lg:text-2xl text-zinc-700 mb-12 sm:mb-14 lg:mb-16 max-w-4xl mx-auto font-bold leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            Start with zero friction. Upgrade for superpowers.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 max-w-6xl mx-auto">
          {/* Free Tier */}
          <div className="bg-neo-bg border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-150 p-8 sm:p-10 lg:p-12">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-neo-cyan border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mx-auto mb-6 hover:rotate-3 hover:scale-105 transition-all duration-150">
                <span className="text-zinc-950 font-black text-2xl">FREE</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-1 uppercase tracking-tight">NO BULLSHIT</h3>
              <p className="text-zinc-700 font-bold text-base sm:text-lg mb-6">Just drag, drop, and vanish. No wallet needed.</p>
            </div>

            <div className="space-y-4 mb-8">
              {[
                "Drag-and-drop file upload",
                "Client-side encryption (Web Crypto API)",
                "IPFS decentralized storage",
                "Password protected files"
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-3"
                >
                  <div className="w-5 h-5 bg-green-500 border-2 border-black flex-shrink-0 hover:rotate-45 hover:scale-110 transition-all duration-150" />
                  <span className="font-bold text-zinc-800 text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>

            <Button className="w-full bg-neo-cyan border-4 border-black text-zinc-950 font-black text-lg px-8 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 uppercase tracking-wide hover:bg-white rounded-none">
              Start Now
              <ArrowRight className="ml-3 w-5 h-5" />
            </Button>
          </div>

          {/* Pro Tier */}
          <div className="bg-neo-bg border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-150 p-8 sm:p-10 lg:p-12 relative">
            <div className="absolute -top-4 -right-4 bg-neo-yellow-1 border-4 border-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="font-black text-zinc-950 text-xs uppercase">Web3 Magic</span>
            </div>

            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-neo-yellow-1 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mx-auto mb-6 hover:rotate-6 hover:scale-105 transition-all duration-150">
                <span className="text-zinc-950 font-black text-2xl">PRO</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 mb-1 uppercase tracking-tight">CRYPTO WIZARDRY</h3>
              <p className="text-zinc-700 font-bold text-base sm:text-lg mb-6">Everything free has +</p>
            </div>

            <div className="space-y-4 mb-8">
              {[
                "Wallet-specific access control",
                "Monetized links with paywalls",
                "Permanent Filecoin storage deals",
                "Smart contract enforced expiry"
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="flex items-start space-x-3"
                >
                  <div className="w-5 h-5 bg-neo-yellow-1 border-2 border-black flex-shrink-0 hover:rotate-45 hover:scale-110 transition-all duration-150" />
                  <span className="font-bold text-zinc-800 text-sm sm:text-base">{feature}</span>
                </div>
              ))}
            </div>

            <Button className="w-full bg-neo-yellow-1 border-4 border-black text-zinc-950 font-black text-lg px-8 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150 uppercase tracking-wide hover:bg-white rounded-none">
              Connect Wallet
              <Wallet className="ml-3 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TwoTierModel;
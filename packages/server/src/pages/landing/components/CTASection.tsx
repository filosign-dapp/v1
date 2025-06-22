import { Button } from "@/src/lib/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const CTASection = () => {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 bg-neo-yellow-1 border-t-4 border-black dotted-pattern relative">
      {/* More floating shapes */}
      <motion.div 
        className="absolute top-12 left-5 w-6 h-6 bg-neo-yellow-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-full"
        animate={{ 
          scale: [1, 1.3, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.h2 
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-zinc-950 mb-6 sm:mb-8 leading-none tracking-tighter uppercase"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.3 }}
        >
          READY TO STOP
          <br />
          <motion.span 
            className="text-neo-indigo-dark"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            TRUSTING?
          </motion.span>
        </motion.h2>
        <Button className="bg-neo-bg border-4 border-black text-zinc-950 font-black text-xl px-12 py-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-150 uppercase tracking-wide hover:bg-white rounded-none">
          Start Sharing
          <ArrowRight className="ml-4 w-6 h-6" />
        </Button>
      </div>
    </section>
  );
};

export default CTASection; 
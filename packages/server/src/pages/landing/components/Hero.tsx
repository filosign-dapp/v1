import { Button } from "@/src/lib/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";

const Hero = () => {
  return (
    <section className="flex items-center px-4 pt-10 pb-12 min-h-screen sm:pb-20 sm:px-6 bg-neo-bg dotted-pattern relative overflow-hidden">
      {/* Floating shapes background - variety of shapes */}
      <motion.div
        className="absolute hidden sm:block left-30 top-20 w-16 h-16 bg-neo-yellow-1 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
        animate={{
          y: [0, -15, 0],
          rotate: [0, 3, -3, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-[3vh] sm:top-15 sm:right-40 right-5 size-10 sm:size-12 bg-neo-indigo border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-full"
        animate={{
          y: [0, 10, 0],
          rotate: [0, -5, 5, 0]
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      <div className="mx-auto w-full max-w-6xl relative z-10">
        <div className="text-center">
          <motion.div
            className="inline-block mb-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className="bg-neo-indigo text-zinc-950 px-4 sm:px-8 py-2 font-black text-sm sm:text-lg uppercase tracking-wider border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              🔒 TRUSTLESS & SECURE
            </span>
          </motion.div>

          <motion.h1
            className="mb-8 font-black tracking-tighter leading-none uppercase text-7xl lg:text-8xl xl:text-9xl text-zinc-900 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            SHARE FILES
            <br />
            <motion.span
              className=""
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              LIKE A <span className="text-neo-beige-1-dark relative">
                NINJA
              </span>
            </motion.span>
          </motion.h1>

          <motion.p
            className="px-4 mx-auto mb-12 max-w-3xl text-lg font-bold leading-relaxed sm:text-xl lg:text-2xl text-zinc-500 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            Drag, drop, done. Your files get encrypted before they even leave your browser.
            <span className="text-zinc-600"> We literally can't see them.</span>
          </motion.p>

          <motion.div
            className="flex flex-col gap-6 justify-center items-center px-4 mb-12 sm:flex-row sm:gap-8 sm:mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Link to="/upload">
              <Button className="w-full sm:w-auto bg-neo-yellow-1 border-4 border-black text-zinc-950 font-black text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-150 uppercase tracking-wide hover:bg-white rounded-none">
                Try It Free
                <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </Button>
            </Link>

            <Link to="/history">
              <Button className="w-full sm:w-auto bg-neo-cyan border-4 border-black text-zinc-950 font-black text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-150 uppercase tracking-wide hover:bg-white rounded-none">
                See The Magic
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
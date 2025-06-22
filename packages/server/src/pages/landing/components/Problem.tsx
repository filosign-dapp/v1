import { AlertTriangle, Eye, Server } from "lucide-react";
import { motion } from "motion/react";

const Problem = () => {
  const problems = [
    {
      icon: Server,
      title: "COMPANY SERVERS",
      description: "Your private files are uploaded directly to someone else's server. You have zero control."
    },
    {
      icon: Eye,
      title: "BLIND FAITH", 
      description: "You're trusting people you've never met with your sensitive files."
    },
    {
      icon: AlertTriangle,
      title: "HONEYPOT PARADISE",
      description: "One hack and everything's gone. It's not if, it's when."
    }
  ];

  return (
    <section id="problem" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-neo-beige-2 min-h-screen flex items-center dotted-pattern relative overflow-hidden">
      {/* Animated warning shapes - variety */}
      <motion.div 
        className="hidden sm:block absolute top-14 right-10 lg:top-30 lg:right-40 size-10 bg-red-500 border-3 border-black rounded-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 4,
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
            <span className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 font-black text-sm sm:text-base uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              ⚠️ REALITY CHECK
            </span>
          </motion.div>
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-zinc-900 mb-6 sm:mb-8 leading-none tracking-tighter uppercase"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            FILE SHARING
            <br />
            <motion.span 
              className="text-red-600"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              IS BROKEN
            </motion.span>
          </motion.h2>
          <motion.p 
            className="text-lg sm:text-xl lg:text-2xl text-zinc-500 max-w-3xl mx-auto font-bold px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            You send your private files to a stranger's server and hope for the best. 
            <span className="text-zinc-600"> That's basically it.</span>
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 max-w-6xl mx-auto">
          {problems.map((problem, index) => (
            <div 
              key={index}
              className="bg-neo-bg p-6 sm:p-8 lg:p-12 border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-150"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center mb-6 sm:mb-8 hover:rotate-3 hover:scale-105 transition-all duration-150">
                <problem.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900 mb-4 sm:mb-6 uppercase tracking-tight leading-tight">{problem.title}</h3>
              <p className="text-zinc-700 font-bold text-base sm:text-lg leading-relaxed">{problem.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
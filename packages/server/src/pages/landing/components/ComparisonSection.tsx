import { motion } from "motion/react";

const ComparisonSection = () => {
  const comparisonData = [
    {
      thing: "FILE SHARING",
      oldWay: "Unencrypted files live on the servers (hackable)",
      portalWay: "Client-side encrypted files stored on IPFS"
    },
    {
      thing: "PASSWORD PROTECTION",  
      oldWay: "Server controls access & distribution",
      portalWay: "Client-side decryption & universal access"
    },
    {
      thing: "LINK EXPIRY",
      oldWay: "Trust them to delete files",
      portalWay: "On-chain enforced self-destruct"
    },
    {
      thing: "STORAGE",
      oldWay: "Central servers (hackable)",
      portalWay: "IPFS + Filecoin distributed (decentralized)"
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-neo-beige-2 dotted-pattern relative">
      {/* Floating shapes - circles and triangles */}
      <motion.div 
        className="absolute top-10 right-16 w-8 h-8 bg-neo-cyan border-4 border-black rounded-full"
        animate={{ 
          y: [0, -12, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12 sm:mb-16"
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
            <span className="bg-neo-cyan text-zinc-950 px-4 sm:px-6 py-2 sm:py-3 font-black text-sm sm:text-base uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              📊 THE RECEIPTS
            </span>
          </motion.div>
          <motion.h2 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-zinc-900 mb-6 sm:mb-8 leading-none tracking-tighter uppercase"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            PORTAL VS
            <br />
            <motion.span 
              className="text-neo-indigo-dark"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              THE OLD WAY
            </motion.span>
          </motion.h2>
        </motion.div>

        {/* Mobile-first responsive layout */}
        <div className="mb-12 sm:mb-16">
          {/* Mobile: Card Layout */}
          <div className="block lg:hidden space-y-6">
            {comparisonData.map((row, index) => (
              <div 
                key={index}
                className="bg-neo-bg border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6"
              >
                <h3 className="font-black text-zinc-900 text-lg uppercase mb-4 border-b-2 border-black pb-2">
                  {row.thing}
                </h3>
                <div className="space-y-4">
                  <div className="bg-zinc-100 border-2 border-neo-beige-1-dark p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 bg-neo-beige-1-dark border"></span>
                      <span className="font-black text-neo-beige-1-dark text-sm uppercase">Old Way</span>
                    </div>
                    <p className="font-bold text-neo-beige-1-dark text-sm">{row.oldWay}</p>
                  </div>
                  <div className="bg-green-50 border-2 border-green-600 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 bg-green-600 border border-black"></span>
                      <span className="font-black text-green-800 text-sm uppercase">Portal Way</span>
                    </div>
                    <p className="font-bold text-green-700 text-sm">{row.portalWay}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full bg-neo-bg border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <thead>
                <tr className="bg-neo-yellow-1 border-b-4 border-black">
                  <th className="px-6 py-6 text-left font-black text-zinc-950 uppercase text-lg border-r-4 border-black">Thing</th>
                  <th className="px-6 py-6 text-left font-black text-zinc-950 uppercase text-lg border-r-4 border-black">Old Way</th>
                  <th className="px-6 py-6 text-left font-black text-zinc-950 uppercase text-lg">Portal Way</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((row, index) => (
                  <tr 
                    key={index} 
                    className="border-b-4 border-black hover:bg-neo-beige-2 transition-colors duration-150"
                  >
                    <td className="px-6 py-6 font-black text-zinc-900 text-base border-r-4 border-black uppercase">{row.thing}</td>
                    <td className="px-6 py-6 font-bold text-neo-beige-1-dark text-base border-r-4 border-black">{row.oldWay}</td>
                    <td className="px-6 py-6 font-bold text-green-700 text-base">{row.portalWay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonSection; 
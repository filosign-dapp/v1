import { motion } from "motion/react";

const Solution = () => {
    const solutionFeatures = [
        "BROWSER DOES THE MAGIC",
        "IPFS HOSTS THE GIBBERISH", 
        "YOU KEEP THE KEY",
        "WE KNOW NOTHING"
    ];

    return (
        <section id="solution" className="py-16 sm:py-24 lg:py-32 px-4 sm:px-6 bg-neo-bg min-h-screen flex items-center dotted-pattern relative overflow-hidden">
            {/* Floating positive shapes - variety */}
            <motion.div 
                className="absolute top-16 right-16 w-10 h-10 bg-green-500 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-full"
                animate={{ 
                    y: [0, -12, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            
            {/* Triangle shape */}
            <motion.div 
                className="absolute bottom-32 right-16 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[20px] border-l-transparent border-r-transparent border-b-neo-cyan"
                animate={{ 
                    rotate: [0, 15, -15, 0],
                    y: [0, -8, 0]
                }}
                transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                }}
            />

            <div className="max-w-7xl mx-auto w-full relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-20 items-center">
                    <motion.div 
                        className="order-1"
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.4 }}
                    >
                        <motion.div 
                            className="inline-block mb-14"
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                        >
                            <span className="bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 font-black text-sm sm:text-base uppercase tracking-wider border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                ✓ PLOT TWIST
                            </span>
                        </motion.div>
                        <motion.h2 
                            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black mb-8 sm:mb-10 lg:mb-12 text-zinc-900 leading-none tracking-tighter uppercase"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            WHAT IF
                            <br />
                            <motion.span 
                                className="text-neo-indigo-dark"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.3, delay: 0.4 }}
                            >
                                WE CAN'T SPY?
                            </motion.span>
                        </motion.h2>
                        <motion.p 
                            className="text-lg sm:text-xl lg:text-2xl text-zinc-700 mb-8 sm:mb-10 lg:mb-12 leading-relaxed font-bold"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.3, delay: 0.3 }}
                        >
                            Your browser encrypts your file before we even see it. Then it goes to a decentralized network. 
                            <span className="text-zinc-900"> We're literally blind to your content.</span>
                        </motion.p>

                        <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            {solutionFeatures.map((feature, index) => (
                                <div 
                                    key={index} 
                                    className="flex items-center space-x-4 sm:space-x-6 bg-neo-bg border-4 border-black p-4 sm:p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all duration-150"
                                >
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-500 border-2 border-black flex-shrink-0 hover:rotate-45 hover:scale-110 transition-all duration-150" />
                                    <span className="font-black text-zinc-900 uppercase text-base sm:text-lg tracking-wide">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        className="relative order-2"
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <div className="bg-neo-bg border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all duration-150 p-6 sm:p-8 lg:p-10">
                            <div className="space-y-6 sm:space-y-8">
                                <motion.div 
                                    className="flex items-center space-x-3 sm:space-x-4 mb-6 sm:mb-8 bg-neo-cyan border-4 border-black p-3 sm:p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.4 }}
                                >
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-black flex-shrink-0 animate-pulse" />
                                    <span className="font-black text-zinc-950 uppercase text-sm sm:text-lg">Encrypting...</span>
                                </motion.div>

                                <motion.div 
                                    className="bg-black border-4 border-black p-4 sm:p-6 lg:p-8 font-mono text-sm sm:text-base lg:text-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.5 }}
                                >
                                    <div className="text-neo-yellow-1 font-black break-all">
                                        $ drag → drop → encrypt
                                    </div>
                                    <div className="text-white mt-3 sm:mt-4 font-bold">
                                        FILE: secrets.pdf<br />
                                        STATUS: scrambled into gibberish<br />
                                        <span className="animate-pulse">SERVER SEES: 💀💀💀💀💀💀💀</span><br />
                                        <span className="text-green-400">✓ LINK READY</span><br />
                                        <span className="text-neo-cyan">🔑 Key stays with you</span>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    className="bg-neo-beige-2 border-4 border-black p-4 sm:p-6 text-center transition-all duration-150"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.6 }}
                                >
                                    <p className="font-black text-zinc-900 text-sm sm:text-base uppercase">
                                        💡 We can't decrypt without your key
                                    </p>
                                    <p className="text-zinc-700 font-bold text-xs sm:text-sm mt-2">
                                        Even our CEO can't help the FBI
                                    </p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Solution;
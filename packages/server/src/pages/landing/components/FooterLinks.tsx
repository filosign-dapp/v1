const FooterLinks = () => {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-neo-bg border-t-4 border-black">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          <div>
            <h3 className="font-black text-zinc-900 text-lg sm:text-xl mb-4 sm:mb-6 uppercase tracking-wide">PORTAL</h3>
            <div className="space-y-3 sm:space-y-4">
              {["Upload Files", "How It Works", "Privacy"].map((link, index) => (
                <a 
                  key={index} 
                  href="#" 
                  className="block text-zinc-700 font-bold hover:text-zinc-900 hover:translate-x-1 transition-all duration-150 text-sm sm:text-base"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-black text-zinc-900 text-lg sm:text-xl mb-4 sm:mb-6 uppercase tracking-wide">FEATURES</h3>
            <div className="space-y-3 sm:space-y-4">
              {["Client-side Encryption", "Password Protection", "Link Expiry"].map((link, index) => (
                <a 
                  key={index} 
                  href="#" 
                  className="block text-zinc-700 font-bold hover:text-zinc-900 hover:translate-x-1 transition-all duration-150 text-sm sm:text-base"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-black text-zinc-900 text-lg sm:text-xl mb-4 sm:mb-6 uppercase tracking-wide">WEB3</h3>
            <div className="space-y-3 sm:space-y-4">
              {["Smart Contracts", "IPFS Storage", "Filecoin"].map((link, index) => (
                <a 
                  key={index} 
                  href="#" 
                  className="block text-zinc-700 font-bold hover:text-zinc-900 hover:translate-x-1 transition-all duration-150 text-sm sm:text-base"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-black text-zinc-900 text-lg sm:text-xl mb-4 sm:mb-6 uppercase tracking-wide">COMPANY</h3>
            <div className="space-y-3 sm:space-y-4">
              {["About", "Terms", "Contact"].map((link, index) => (
                <a 
                  key={index} 
                  href="#" 
                  className="block text-zinc-700 font-bold hover:text-zinc-900 hover:translate-x-1 transition-all duration-150 text-sm sm:text-base"
                >
                  {link}
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t-4 border-black pt-8 sm:pt-12 text-center">
          <p className="text-zinc-700 font-black text-sm sm:text-lg uppercase tracking-wider">
            © 2025 PORTAL
          </p>
        </div>
      </div>
    </section>
  );
};

export default FooterLinks; 
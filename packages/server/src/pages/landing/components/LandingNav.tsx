import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b-4 border-black bg-neo-bg w-full">
      <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-3">
            <div className="size-10 bg-neo-yellow-1 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-sm font-black text-zinc-950 sm:text-lg">P</span>
            </div>
            <span className="text-lg font-black ml-1 mt-1 sm:text-2xl text-zinc-900">PORTAL</span>
          </Link>

          <div className="hidden items-center space-x-8 md:flex lg:space-x-12">
            <a href="#problem" className="px-3 py-2 text-sm font-black tracking-wide uppercase transition-colors text-zinc-800 hover:bg-neo-beige-1 lg:px-4 lg:text-lg">The Problem</a>
            <a href="#solution" className="px-3 py-2 text-sm font-black tracking-wide uppercase transition-colors text-zinc-800 hover:bg-neo-beige-1 lg:px-4 lg:text-lg">Our Fix</a>
            <a href="#tiers" className="px-3 py-2 text-sm font-black tracking-wide uppercase transition-colors text-zinc-800 hover:bg-neo-beige-1 lg:px-4 lg:text-lg">Pricing</a>
          </div>

          <div className="hidden items-center space-x-4 md:flex lg:space-x-6">
            <Link to="/upload" className="bg-neo-yellow-1 border-4 border-black text-zinc-950 font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase text-sm lg:text-lg hover:bg-white rounded-none p-2">
              Upload Files
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="p-2 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-zinc-900" />
            ) : (
              <Menu className="w-6 h-6 text-zinc-900" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="pt-4 mt-4 space-y-2 border-t-4 border-black md:hidden">
            <a href="#problem" className="block px-4 py-2 text-lg font-black tracking-wide uppercase transition-colors text-zinc-800 hover:bg-neo-beige-1">The Problem</a>
            <a href="#solution" className="block px-4 py-2 text-lg font-black tracking-wide uppercase transition-colors text-zinc-800 hover:bg-neo-beige-1">Our Fix</a>
            <a href="#tiers" className="block px-4 py-2 text-lg font-black tracking-wide uppercase transition-colors text-zinc-800 hover:bg-neo-beige-1">Pricing</a>
            <div className="flex flex-col pt-4 space-y-4">
              <Link to="/upload" className="bg-neo-yellow-1 border-4 border-black text-zinc-950 font-black px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all uppercase text-lg hover:bg-white rounded-none">
                Upload Files
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
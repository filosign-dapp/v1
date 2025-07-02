import Navbar from "@/src/lib/components/app/Navbar";
import Sidebar from "@/src/lib/components/app/Sidebar";
import ThemeSwitch from "@/src/lib/components/custom/ThemeSwitch";

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-neo-bg [--navbar-height:5rem] sm:[--sidebar-width:0rem] [--paddingx:1rem] sm:[--paddingx:2rem]">
      <div className="h-[var(--navbar-height)] border-b-4 border-black">
        <Navbar />
      </div>

      <div className="ml-[var(--sidebar-width)] h-[calc(100dvh-var(--navbar-height))] @container/main">
        {children}
      </div>
    </div>
  )
}
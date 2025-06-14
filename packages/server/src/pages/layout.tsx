import Navbar from "@/src/lib/components/app/Navbar";
import Sidebar from "@/src/lib/components/app/Sidebar";
import ThemeSwitch from "@/src/lib/components/custom/ThemeSwitch";
import Connect from "@/src/lib/components/app/Connect";

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background [--navbar-height:0rem] sm:[--sidebar-width:0rem] overflow-auto">
      {/* <Navbar /> */}
      {/* <Sidebar /> */}

      <div className="absolute z-10 top-4 right-4">
        <Connect />
      </div>

      <div className="mt-[calc(var(--navbar-height))] ml-[var(--sidebar-width)] h-[calc(100dvh-var(--navbar-height))] @container/main">
        {children}
      </div>

      <div className="fixed bottom-4 right-4">
        <ThemeSwitch />
      </div>
    </div>
  )
}
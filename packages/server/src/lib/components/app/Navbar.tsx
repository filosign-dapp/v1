import Icon from "../custom/Icon";
import { Button } from "../ui/button";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import Connect from "./Connect";
import Premium from "./Premium";
import { usePrivy } from "@privy-io/react-auth";

export default function Navbar() {
  const navigate = useNavigate()
  const router = useRouter()
  const currentPath = router.state.location.pathname

  return (
    <nav className="fixed top-0 gap-2 h-[var(--navbar-height)] w-full bg-background flex items-center justify-between px-[var(--paddingx)] border-b">
      <Link to="/" className="size-10 bg-background border-4 border-foreground shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center shadow-foreground hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all">
        <span className="text-sm font-black text-foreground sm:text-lg">P</span>
      </Link>

      <div className="flex gap-2">
        <Premium />

        <Button
          onClick={() => navigate({ to: currentPath !== '/upload' ? '/upload' : '/history' })}
          className="flex items-center gap-2 relative rounded-sm px-3 py-5"
        >
          {currentPath !== '/upload' ? <Icon name="CloudUpload" className="w-4 h-4" /> : <Icon name="History" className="w-4 h-4" />}
        </Button>

        <Connect />
      </div>
    </nav>
  )
}
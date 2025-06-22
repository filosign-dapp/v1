import Icon from "../custom/Icon";
import { Button } from "../ui/button";
import { useNavigate, useRouter } from "@tanstack/react-router";
import Connect from "./Connect";

export default function Navbar() {
  const navigate = useNavigate()
  const router = useRouter()
  const currentPath = router.state.location.pathname

  return (
    <nav className="fixed top-0 gap-2 h-[var(--navbar-height)] w-full z-50 bg-background flex items-center justify-end px-4">
      <div className="flex gap-2">
        <Button
          onClick={() => navigate({ to: currentPath === '/history' ? '/upload' : '/history' })}
          className="flex items-center gap-2 relative rounded-sm"
        >
          {currentPath === '/history' ? <Icon name="CloudUpload" className="w-4 h-4" /> : <Icon name="History" className="w-4 h-4" />}
        </Button>

        <Connect />
      </div>
    </nav>
  )
}
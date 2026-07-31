import { Link, NavLink } from "../../../lib/router.jsx";
import { LifeBuoy, LogIn, UserPlus } from "lucide-react";
import Button from "../Button/Button.jsx";

const Navbar = () => (
  <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
      <Link to="/" className="flex items-center gap-2 text-lg font-bold text-slate-950">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
          <LifeBuoy className="h-5 w-5" />
        </span>
        SupportDesk AI
      </Link>
      <div className="flex items-center gap-2">
        <NavLink
          to="/login"
          className="focus-ring rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        >
          <LogIn className="mr-1.5 inline h-4 w-4 align-[-2px]" />
          Login
        </NavLink>
        <Button as={Link} to="/register" className="hidden sm:inline-flex">
          <UserPlus className="h-4 w-4" />
          Register
        </Button>
      </div>
    </nav>
  </header>
);

export default Navbar;

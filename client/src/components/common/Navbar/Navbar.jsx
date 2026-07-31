import { Link, NavLink } from "../../../lib/router.jsx";
import { LifeBuoy } from "lucide-react";
import Button from "../Button/Button.jsx";

const Navbar = () => (
  <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
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
          Login
        </NavLink>
        <Button as="span" className="hidden sm:inline-flex">
          <Link to="/register">Register</Link>
        </Button>
      </div>
    </nav>
  </header>
);

export default Navbar;

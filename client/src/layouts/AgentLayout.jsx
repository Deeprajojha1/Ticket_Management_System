import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "../lib/router.jsx";
import { BarChart3, Command, Inbox, LayoutDashboard, LifeBuoy, LogOut, Menu, Moon, Search, Sun, User, X } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import Button from "../components/common/Button/Button.jsx";
import ConnectionStatus from "../components/ConnectionStatus.jsx";
import NotificationBell from "../features/notifications/NotificationBell.jsx";
import { useLogoutMutation } from "../app/services/authApi.js";
import { clearCredentials } from "../features/auth/authSlice.js";
import { useAuth } from "../hooks/useAuth.js";

const navItems = [
  { label: "Dashboard", to: "/agent/dashboard", icon: LayoutDashboard },
  { label: "All Tickets", to: "/agent/tickets", icon: Inbox },
  { label: "Assigned", to: "/agent/assigned", icon: User },
  { label: "Analytics", to: "/agent/analytics", icon: BarChart3 },
];

const AgentLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [logout, { isLoading }] = useLogoutMutation();

  const breadcrumb = useMemo(() => {
    const active = navItems.find((item) => location.pathname.startsWith(item.to));
    return active?.label || "Dashboard";
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearCredentials());
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(error?.data?.message || "Logout failed");
    }
  };

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <Link to="/agent/dashboard" className="flex items-center gap-2 text-base font-bold text-slate-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
            <LifeBuoy className="h-5 w-5" />
          </span>
          SupportDesk AI
        </Link>
        <button className="focus-ring rounded-md p-2 text-slate-500 lg:hidden" onClick={() => setIsSidebarOpen(false)} aria-label="Close menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setIsSidebarOpen(false)}
            className={({ isActive }) =>
              `focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <Button variant="ghost" className="w-full justify-start" onClick={handleLogout} isLoading={isLoading}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <div className={`${isDark ? "dark" : ""} min-h-screen bg-slate-50`}>
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
      {isSidebarOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 lg:hidden">
          <div className="h-full">{sidebar}</div>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button className="focus-ring rounded-md p-2 text-slate-600 lg:hidden" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-medium text-slate-500">Agent / {breadcrumb}</p>
                <h1 className="truncate text-base font-bold text-slate-950">{breadcrumb}</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="focus-ring hidden min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-500 shadow-sm md:flex"
                onClick={() => setIsCommandOpen(true)}
              >
                <Search className="h-4 w-4" />
                Search tickets
                <span className="ml-8 rounded border border-slate-200 px-1.5 py-0.5 text-xs">Ctrl K</span>
              </button>
              <button className="focus-ring rounded-lg p-2.5 text-slate-600 hover:bg-slate-100" onClick={() => setIsDark((value) => !value)} aria-label="Toggle theme">
                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <ConnectionStatus />
              <NotificationBell />
              <div className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 sm:flex">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                  {(user?.fullName || "A").slice(0, 1).toUpperCase()}
                </div>
                <div className="max-w-36">
                  <p className="truncate text-sm font-semibold text-slate-900">{user?.fullName || "Agent"}</p>
                  <p className="truncate text-xs text-slate-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {isCommandOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/30 px-4 pt-24" onClick={() => setIsCommandOpen(false)}>
          <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-3 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center gap-2 border-b border-slate-200 px-2 py-2">
              <Command className="h-4 w-4 text-slate-500" />
              <input autoFocus className="w-full bg-transparent text-sm outline-none" placeholder="Go to dashboard, tickets, assigned, analytics..." />
            </div>
            <div className="mt-2 grid gap-1">
              {navItems.map((item) => (
                <button
                  key={item.to}
                  className="focus-ring rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    navigate(item.to);
                    setIsCommandOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AgentLayout;

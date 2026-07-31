import { Link, Outlet } from "../lib/router.jsx";
import { Bot, LifeBuoy, LayoutDashboard, LogOut, MessageSquare, Plus, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../app/services/authApi.js";
import { clearCredentials } from "../features/auth/authSlice.js";
import Sidebar from "../components/common/Sidebar/Sidebar.jsx";
import Button from "../components/common/Button/Button.jsx";
import ConnectionStatus from "../components/ConnectionStatus.jsx";
import NotificationBell from "../features/notifications/NotificationBell.jsx";
import AIChatWidget from "../features/ai/components/AIChatWidget.jsx";
import { useAuth } from "../hooks/useAuth.js";

const CustomerLayout = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [logout, { isLoading }] = useLogoutMutation();
  const items = [
    { label: "Dashboard", to: "/customer/dashboard", icon: LayoutDashboard },
    { label: "My Tickets", to: "/customer/tickets", icon: Ticket },
    { label: "AI Assistant", to: "/customer/assistant", icon: Bot },
    { label: "Messages", to: "/customer/assistant", icon: MessageSquare },
  ];

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearCredentials());
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Logout failed");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/customer/dashboard" className="flex items-center gap-2 text-base font-bold text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <LifeBuoy className="h-5 w-5" />
            </span>
            SupportDesk AI
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">{user?.fullName || "Customer"}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>
            <Button as={Link} to="/customer/tickets/create" variant="secondary" className="hidden sm:inline-flex">
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
            <ConnectionStatus />
            <NotificationBell />
            <Button variant="ghost" isLoading={isLoading} onClick={handleLogout} aria-label="Logout">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>
      <div className="flex">
      <Sidebar items={items} />
      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      </div>
      <AIChatWidget />
    </div>
  );
};

export default CustomerLayout;

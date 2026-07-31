import { Link, Outlet, useLocation, useNavigate } from "../lib/router.jsx";
import { Bot, LifeBuoy, LayoutDashboard, LogOut, Ticket } from "lucide-react";
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
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [logout, { isLoading }] = useLogoutMutation();
  const isAssistantRoute = location.pathname.startsWith("/customer/assistant");
  const items = [
    { label: "Dashboard", to: "/customer/dashboard", icon: LayoutDashboard },
    { label: "My Tickets", to: "/customer/tickets", icon: Ticket },
    { label: "AI Assistant", to: "/customer/assistant", icon: Bot },
  ];

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

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200 bg-white/95 backdrop-blur">
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
            <ConnectionStatus />
            <NotificationBell />
          </div>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Sidebar
          items={items}
          footer={
            <Button variant="ghost" className="w-full justify-start" isLoading={isLoading} onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          }
        />
        <main className={`min-w-0 flex-1 ${isAssistantRoute ? "overflow-hidden p-2 sm:p-4 lg:p-5" : "overflow-y-auto p-4 sm:p-6 lg:p-8"}`}>
          <Outlet />
        </main>
      </div>
      {!isAssistantRoute ? <AIChatWidget /> : null}
    </div>
  );
};

export default CustomerLayout;

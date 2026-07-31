import { Outlet } from "../lib/router.jsx";
import Navbar from "../components/common/Navbar/Navbar.jsx";

const AuthLayout = () => (
  <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
    <Navbar />
    <main className="min-h-0 flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);

export default AuthLayout;

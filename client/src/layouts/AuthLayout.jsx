import { Outlet } from "../lib/router.jsx";
import Navbar from "../components/common/Navbar/Navbar.jsx";

const AuthLayout = () => (
  <div className="min-h-screen bg-slate-50">
    <Navbar />
    <main>
      <Outlet />
    </main>
  </div>
);

export default AuthLayout;

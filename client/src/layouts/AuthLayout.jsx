import { Outlet, useLocation } from "../lib/router.jsx";
import Navbar from "../components/common/Navbar/Navbar.jsx";

const AuthLayout = () => {
  const { pathname } = useLocation();
  const showNavbar = pathname === "/";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      {showNavbar ? <Navbar /> : null}
      <main className="min-h-0 flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AuthLayout;

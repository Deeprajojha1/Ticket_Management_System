import { Navigate, Outlet } from "../../../lib/router.jsx";
import { roleHomePath } from "../../../constants/auth.js";
import { useAuth } from "../../../hooks/useAuth.js";
import Loader from "../Loader/Loader.jsx";

const GuestRoute = ({ isCheckingProfile = false }) => {
  const { isAuthenticated, isAuthChecked, user } = useAuth();

  if (!isAuthChecked || isCheckingProfile) {
    return <Loader label="Checking session" />;
  }

  if (isAuthenticated) {
    return <Navigate to={roleHomePath[user?.role] || "/customer"} replace />;
  }

  return <Outlet />;
};

export default GuestRoute;

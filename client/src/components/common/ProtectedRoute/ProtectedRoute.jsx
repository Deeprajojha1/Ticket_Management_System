import { Navigate, Outlet, useLocation } from "../../../lib/router.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import Loader from "../Loader/Loader.jsx";

const ProtectedRoute = ({ isCheckingProfile = false }) => {
  const { isAuthenticated, isAuthChecked } = useAuth();
  const location = useLocation();

  if (!isAuthChecked || isCheckingProfile) {
    return <Loader label="Checking session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

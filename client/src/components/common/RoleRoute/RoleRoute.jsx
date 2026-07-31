import { Navigate, Outlet } from "../../../lib/router.jsx";
import { useAuth } from "../../../hooks/useAuth.js";

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default RoleRoute;

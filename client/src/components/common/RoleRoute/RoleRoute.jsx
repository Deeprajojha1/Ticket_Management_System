import { Navigate, Outlet } from "../../../lib/router.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import { roleHomePath } from "../../../constants/auth.js";

const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={roleHomePath[user?.role] || "/unauthorized"} replace />;
  }

  return <Outlet />;
};

export default RoleRoute;

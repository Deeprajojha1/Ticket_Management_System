import { useEffect } from "react";
import { Route, Routes } from "./lib/router.jsx";
import { useDispatch } from "react-redux";
import { useProfileQuery } from "./app/services/authApi.js";
import { setCredentials, setAuthChecked } from "./features/auth/authSlice.js";
import ProtectedRoute from "./components/common/ProtectedRoute/ProtectedRoute.jsx";
import RoleRoute from "./components/common/RoleRoute/RoleRoute.jsx";
import GuestRoute from "./components/common/GuestRoute/GuestRoute.jsx";
import { USER_ROLES } from "./constants/auth.js";
import AuthLayout from "./layouts/AuthLayout.jsx";
import AgentLayout from "./layouts/AgentLayout.jsx";
import CustomerLayout from "./layouts/CustomerLayout.jsx";
import Landing from "./pages/Landing/Landing.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import Unauthorized from "./pages/Unauthorized/Unauthorized.jsx";
import NotFound from "./pages/NotFound/NotFound.jsx";
import CustomerDashboard from "./features/tickets/pages/CustomerDashboard.jsx";
import CreateTicket from "./features/tickets/pages/CreateTicket.jsx";
import MyTickets from "./features/tickets/pages/MyTickets.jsx";
import TicketDetails from "./features/tickets/pages/TicketDetails.jsx";
import AIChatPage from "./features/ai/pages/AIChatPage.jsx";
import AgentDashboard from "./features/agent/pages/AgentDashboard.jsx";
import AgentTickets from "./features/agent/pages/AgentTickets.jsx";
import AssignedTickets from "./features/agent/pages/AssignedTickets.jsx";
import Analytics from "./features/agent/pages/Analytics.jsx";
import { authApi } from "./app/services/authApi.js";
import { dashboardApi } from "./features/agent/services/dashboardApi.js";
import { ticketApi } from "./features/tickets/services/ticketApi.js";
import { aiApi } from "./features/ai/services/aiApi.js";
import { clearCredentials } from "./features/auth/authSlice.js";
import { disconnectSocket } from "./socket/socket.js";

const App = () => {
  const dispatch = useDispatch();
  const { data, isSuccess, isError, isFetching } = useProfileQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setCredentials(data?.data?.user));
    }

    if (isError) {
      dispatch(setAuthChecked());
    }
  }, [data, dispatch, isError, isSuccess]);

  useEffect(() => {
    const handleAuthExpired = () => {
      disconnectSocket();
      dispatch(clearCredentials());
      dispatch(authApi.util.resetApiState());
      dispatch(ticketApi.util.resetApiState());
      dispatch(dashboardApi.util.resetApiState());
      dispatch(aiApi.util.resetApiState());
      window.history.replaceState({ usr: null }, "", "/login");
      window.dispatchEvent(new Event("popstate"));
    };

    window.addEventListener("supportdesk:auth-expired", handleAuthExpired);
    return () => window.removeEventListener("supportdesk:auth-expired", handleAuthExpired);
  }, [dispatch]);

  return (
    <Routes>
      <Route element={<GuestRoute isCheckingProfile={isFetching} />}>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Route>

      <Route element={<ProtectedRoute isCheckingProfile={isFetching} />}>
        <Route element={<RoleRoute allowedRoles={[USER_ROLES.CUSTOMER]} />}>
          <Route path="/customer" element={<CustomerLayout />}>
            <Route index element={<CustomerDashboard />} />
            <Route path="dashboard" element={<CustomerDashboard />} />
            <Route path="tickets" element={<MyTickets />} />
            <Route path="tickets/create" element={<CreateTicket />} />
            <Route path="tickets/:ticketId" element={<TicketDetails />} />
            <Route path="assistant" element={<AIChatPage />} />
          </Route>
        </Route>
        <Route element={<RoleRoute allowedRoles={[USER_ROLES.AGENT]} />}>
          <Route path="/agent" element={<AgentLayout />}>
            <Route index element={<AgentDashboard />} />
            <Route path="dashboard" element={<AgentDashboard />} />
            <Route path="tickets" element={<AgentTickets />} />
            <Route path="assigned" element={<AssignedTickets />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;

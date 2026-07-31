import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "./lib/router.jsx";
import { AnimatePresence } from "framer-motion";
import { useDispatch } from "react-redux";
import { useProfileQuery } from "./app/services/authApi.js";
import { setCredentials, setAuthChecked } from "./features/auth/authSlice.js";
import ProtectedRoute from "./components/common/ProtectedRoute/ProtectedRoute.jsx";
import RoleRoute from "./components/common/RoleRoute/RoleRoute.jsx";
import Loader from "./components/common/Loader/Loader.jsx";
import { USER_ROLES } from "./constants/auth.js";

const AuthLayout = lazy(() => import("./layouts/AuthLayout.jsx"));
const AgentLayout = lazy(() => import("./layouts/AgentLayout.jsx"));
const CustomerLayout = lazy(() => import("./layouts/CustomerLayout.jsx"));
const Landing = lazy(() => import("./pages/Landing/Landing.jsx"));
const Login = lazy(() => import("./pages/Login/Login.jsx"));
const Register = lazy(() => import("./pages/Register/Register.jsx"));
const Unauthorized = lazy(() => import("./pages/Unauthorized/Unauthorized.jsx"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound.jsx"));
const CustomerDashboard = lazy(() => import("./features/tickets/pages/CustomerDashboard.jsx"));
const CreateTicket = lazy(() => import("./features/tickets/pages/CreateTicket.jsx"));
const MyTickets = lazy(() => import("./features/tickets/pages/MyTickets.jsx"));
const TicketDetails = lazy(() => import("./features/tickets/pages/TicketDetails.jsx"));
const AIChatPage = lazy(() => import("./features/ai/pages/AIChatPage.jsx"));
const AgentDashboard = lazy(() => import("./features/agent/pages/AgentDashboard.jsx"));
const AgentTickets = lazy(() => import("./features/agent/pages/AgentTickets.jsx"));
const AssignedTickets = lazy(() => import("./features/agent/pages/AssignedTickets.jsx"));
const Analytics = lazy(() => import("./features/agent/pages/Analytics.jsx"));

const App = () => {
  const location = useLocation();
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

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<Loader label="Loading page" />}>
        <Routes location={location} key={location.pathname}>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
      </Suspense>
    </AnimatePresence>
  );
};

export default App;

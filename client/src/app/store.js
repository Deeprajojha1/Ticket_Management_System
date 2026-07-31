import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice.js";
import { authApi } from "./services/authApi.js";
import { ticketApi } from "../features/tickets/services/ticketApi.js";
import { dashboardApi } from "../features/agent/services/dashboardApi.js";
import { aiApi } from "../features/ai/services/aiApi.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [authApi.reducerPath]: authApi.reducer,
    [ticketApi.reducerPath]: ticketApi.reducer,
    [dashboardApi.reducerPath]: dashboardApi.reducer,
    [aiApi.reducerPath]: aiApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(authApi.middleware, ticketApi.middleware, dashboardApi.middleware, aiApi.middleware),
  devTools: import.meta.env.DEV,
});

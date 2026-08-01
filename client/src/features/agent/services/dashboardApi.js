import { createApi } from "@reduxjs/toolkit/query/react";
import axiosInstance from "../../../utils/axiosInstance.js";

const axiosBaseQuery =
  () =>
  async ({ url, method, data, params }) => {
    try {
      const result = await axiosInstance({ url, method, data, params });
      return { data: result.data };
    } catch (axiosError) {
      return {
        error: {
          status: axiosError.response?.status,
          data: axiosError.response?.data || { message: axiosError.message },
        },
      };
    }
  };

export const dashboardApi = createApi({
  reducerPath: "dashboardApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["AgentOverview", "AgentTickets", "AgentActivity", "Agents", "Notifications"],
  endpoints: (builder) => ({
    overview: builder.query({
      query: () => ({ url: "/dashboard/overview", method: "GET" }),
      providesTags: ["AgentOverview"],
    }),
    statusChart: builder.query({
      query: () => ({ url: "/dashboard/charts/status", method: "GET" }),
    }),
    priorityChart: builder.query({
      query: () => ({ url: "/dashboard/charts/priority", method: "GET" }),
    }),
    categoryChart: builder.query({
      query: () => ({ url: "/dashboard/charts/category", method: "GET" }),
    }),
    monthlyChart: builder.query({
      query: () => ({ url: "/dashboard/charts/monthly", method: "GET" }),
    }),
    allTickets: builder.query({
      query: (params = {}) => ({ url: "/agent/tickets", method: "GET", params }),
      providesTags: ["AgentTickets"],
    }),
    agents: builder.query({
      query: () => ({ url: "/agent/agents", method: "GET" }),
      providesTags: ["Agents"],
    }),
    assignedTickets: builder.query({
      query: (params = {}) => ({ url: "/dashboard/my-tickets", method: "GET", params }),
      providesTags: ["AgentTickets"],
    }),
    recentActivity: builder.query({
      query: (params = { page: 1, limit: 12 }) => ({ url: "/dashboard/activity", method: "GET", params }),
      providesTags: ["AgentActivity"],
    }),
    updateStatus: builder.mutation({
      query: ({ ticketId, status }) => ({
        url: `/agent/tickets/${ticketId}/status`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: ["AgentTickets", "AgentOverview", "AgentActivity"],
    }),
    updatePriority: builder.mutation({
      query: ({ ticketId, priority }) => ({
        url: `/agent/tickets/${ticketId}/priority`,
        method: "PATCH",
        data: { priority },
      }),
      invalidatesTags: ["AgentTickets", "AgentOverview", "AgentActivity"],
    }),
    assignTicket: builder.mutation({
      query: ({ ticketId, agentId }) => ({
        url: `/agent/tickets/${ticketId}/assign`,
        method: "PATCH",
        data: agentId ? { agentId } : {},
      }),
      invalidatesTags: ["AgentTickets", "AgentOverview", "AgentActivity", "Notifications"],
    }),
    notifications: builder.query({
      query: (params = { page: 1, limit: 8 }) => ({ url: "/notifications", method: "GET", params }),
      providesTags: ["Notifications"],
    }),
    markAllNotificationsRead: builder.mutation({
      query: () => ({ url: "/notifications/read-all", method: "PATCH" }),
      invalidatesTags: ["Notifications"],
    }),
  }),
});

export const {
  useAllTicketsQuery,
  useAgentsQuery,
  useAssignTicketMutation,
  useAssignedTicketsQuery,
  useCategoryChartQuery,
  useMarkAllNotificationsReadMutation,
  useMonthlyChartQuery,
  useNotificationsQuery,
  useOverviewQuery,
  usePriorityChartQuery,
  useRecentActivityQuery,
  useStatusChartQuery,
  useUpdatePriorityMutation,
  useUpdateStatusMutation,
} = dashboardApi;

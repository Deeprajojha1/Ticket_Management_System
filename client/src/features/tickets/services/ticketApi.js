import { createApi } from "@reduxjs/toolkit/query/react";
import axiosInstance from "../../../utils/axiosInstance.js";
import { dashboardApi } from "../../agent/services/dashboardApi.js";

const axiosBaseQuery =
  () =>
  async ({ url, method, data, params, headers, onUploadProgress }) => {
    try {
      const result = await axiosInstance({ url, method, data, params, headers, onUploadProgress });
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

const toFormData = (payload = {}) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (key === "attachments") {
      (value || []).forEach((file) => formData.append("attachments", file));
      return;
    }

    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  return formData;
};

export const ticketApi = createApi({
  reducerPath: "ticketApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Tickets", "Ticket", "Comments"],
  endpoints: (builder) => ({
    getMyTickets: builder.query({
      query: (params = {}) => ({
        url: "/tickets/my",
        method: "GET",
        params,
      }),
      providesTags: ["Tickets"],
    }),
    getTicket: builder.query({
      query: (ticketId) => ({
        url: `/tickets/${ticketId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, ticketId) => [{ type: "Ticket", id: ticketId }],
    }),
    createTicket: builder.mutation({
      query: ({ payload, onUploadProgress }) => ({
        url: "/tickets",
        method: "POST",
        data: toFormData(payload),
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
      }),
      invalidatesTags: ["Tickets"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(dashboardApi.util.invalidateTags(["AgentTickets", "AgentOverview", "AgentActivity", "Notifications"]));
        } catch {
          // RTK Query will expose the mutation error to the caller.
        }
      },
    }),
    updateTicket: builder.mutation({
      query: ({ ticketId, payload, onUploadProgress }) => ({
        url: `/tickets/${ticketId}`,
        method: "PATCH",
        data: toFormData(payload),
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
      }),
      invalidatesTags: (_result, _error, { ticketId }) => ["Tickets", { type: "Ticket", id: ticketId }],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(dashboardApi.util.invalidateTags(["AgentTickets", "AgentOverview", "AgentActivity"]));
        } catch {
          // RTK Query will expose the mutation error to the caller.
        }
      },
    }),
    deleteTicket: builder.mutation({
      query: (ticketId) => ({
        url: `/tickets/${ticketId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tickets"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(dashboardApi.util.invalidateTags(["AgentTickets", "AgentOverview", "AgentActivity"]));
        } catch {
          // RTK Query will expose the mutation error to the caller.
        }
      },
    }),
    getComments: builder.query({
      query: ({ ticketId, page = 1, limit = 50, sort = "oldest" }) => ({
        url: `/tickets/${ticketId}/comments`,
        method: "GET",
        params: { page, limit, sort },
      }),
      providesTags: (_result, _error, { ticketId }) => [{ type: "Comments", id: ticketId }],
    }),
    createComment: builder.mutation({
      query: ({ ticketId, payload, onUploadProgress }) => ({
        url: `/tickets/${ticketId}/comments`,
        method: "POST",
        data: toFormData(payload),
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
      }),
      invalidatesTags: (_result, _error, { ticketId }) => [{ type: "Ticket", id: ticketId }, "Tickets"],
      async onQueryStarted({ ticketId }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const comment = data?.data?.comment;
          if (comment) {
            dispatch(
              ticketApi.util.updateQueryData("getComments", { ticketId, page: 1, limit: 50, sort: "oldest" }, (draft) => {
                const comments = draft?.data?.comments;
                if (!Array.isArray(comments) || comments.some((item) => item._id === comment._id)) return;
                comments.push(comment);
                if (draft.data?.pagination?.totalDocuments !== undefined) {
                  draft.data.pagination.totalDocuments += 1;
                }
              }),
            );
          }
          dispatch(dashboardApi.util.invalidateTags(["AgentTickets", "AgentOverview", "AgentActivity", "Notifications"]));
        } catch {
          // RTK Query will expose the mutation error to the caller.
        }
      },
    }),
  }),
});

export const {
  useCreateCommentMutation,
  useCreateTicketMutation,
  useDeleteTicketMutation,
  useGetCommentsQuery,
  useGetMyTicketsQuery,
  useGetTicketQuery,
  useUpdateTicketMutation,
} = ticketApi;

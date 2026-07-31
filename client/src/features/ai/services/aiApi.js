import { createApi } from "@reduxjs/toolkit/query/react";
import axiosInstance from "../../../utils/axiosInstance.js";

const axiosBaseQuery =
  () =>
  async ({ url, method, data, params, headers }) => {
    try {
      const result = await axiosInstance({ url, method, data, params, headers });
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

const toChatFormData = ({ message, conversationId, attachments = [] }) => {
  const formData = new FormData();
  formData.append("message", message);
  if (conversationId) formData.append("conversationId", conversationId);
  attachments.forEach((file) => formData.append("attachments", file));
  return formData;
};

const toAudioFormData = ({ audio, conversationId }) => {
  const formData = new FormData();
  formData.append("audio", audio);
  if (conversationId) formData.append("conversationId", conversationId);
  return formData;
};

export const aiApi = createApi({
  reducerPath: "aiApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["AIConversations", "AIConversation"],
  endpoints: (builder) => ({
    sendMessage: builder.mutation({
      query: (payload) => ({
        url: "/ai/chat",
        method: "POST",
        data: toChatFormData(payload),
        headers: { "Content-Type": "multipart/form-data" },
      }),
      invalidatesTags: ["AIConversations"],
    }),
    transcribe: builder.mutation({
      query: (payload) => ({
        url: "/ai/transcribe",
        method: "POST",
        data: toAudioFormData(payload),
        headers: { "Content-Type": "multipart/form-data" },
      }),
    }),
    textToSpeech: builder.mutation({
      query: ({ text }) => ({
        url: "/ai/text-to-speech",
        method: "POST",
        data: { text },
      }),
    }),
    history: builder.query({
      query: (params = { page: 1, limit: 20 }) => ({
        url: "/ai/history",
        method: "GET",
        params,
      }),
      providesTags: ["AIConversations"],
    }),
    conversation: builder.query({
      query: (conversationId) => ({
        url: `/ai/history/${conversationId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, conversationId) => [{ type: "AIConversation", id: conversationId }],
    }),
    deleteConversation: builder.mutation({
      query: (conversationId) => ({
        url: `/ai/history/${conversationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AIConversations"],
    }),
  }),
});

export const {
  useConversationQuery,
  useDeleteConversationMutation,
  useHistoryQuery,
  useSendMessageMutation,
  useTextToSpeechMutation,
  useTranscribeMutation,
} = aiApi;

import ChatMessage from "../models/ChatMessage.model.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";
import { AI_MESSAGE_ROLES } from "../utils/constants.js";
import { transcribeAudioFile } from "./assembly.service.js";
import {
  addMessage,
  deleteConversation,
  getConversationHistory,
  getConversationWithMessages,
  getOrCreateConversation,
  listConversations,
} from "./conversation.service.js";
import { generateGeminiReply } from "./gemini.service.js";
import { generateSpeech } from "./murf.service.js";
import { buildSupportPrompt } from "./prompt.service.js";

const uploadChatAttachments = async (files = []) =>
  Promise.all(
    files.map((file) => uploadBufferToCloudinary(file, "supportdesk-ai/ai-chat")),
  );

export const sendChatMessage = async ({ user, payload, files = [] }) => {
  const conversation = await getOrCreateConversation({
    user,
    conversationId: payload.conversationId,
  });
  const attachments = await uploadChatAttachments(files);
  const history = await getConversationHistory(conversation._id);

  await addMessage({
    conversation,
    user,
    role: AI_MESSAGE_ROLES.USER,
    content: payload.message,
    attachments,
  });

  const { prompt, customerContext } = await buildSupportPrompt({
    user,
    history,
    message: payload.message,
    attachments,
  });

  console.log(
    `AI prompt prepared for user:${user._id} conversation:${conversation._id} tickets:${customerContext.totalTickets}`,
  );
  const aiResult = await generateGeminiReply({ prompt });

  await addMessage({
    conversation,
    user,
    role: AI_MESSAGE_ROLES.ASSISTANT,
    content: aiResult.reply,
    metadata: {
      usage: aiResult.usage,
      responseTimeMs: aiResult.responseTimeMs,
    },
  });

  return {
    reply: aiResult.reply,
    conversationId: conversation._id,
    attachments,
  };
};

export const transcribeAudio = async ({ user, payload, file }) => {
  const transcript = await transcribeAudioFile(file);

  if (payload.conversationId && transcript) {
    const conversation = await getOrCreateConversation({
      user,
      conversationId: payload.conversationId,
    });

    await addMessage({
      conversation,
      user,
      role: AI_MESSAGE_ROLES.USER,
      content: transcript,
      metadata: {
        source: "audio-transcription",
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });
  }

  return { transcript, conversationId: payload.conversationId || null };
};

export const textToSpeech = async ({ text }) => {
  const audioUrl = await generateSpeech(text);
  return { audioUrl };
};

export const getChatHistory = ({ user, queryString }) =>
  listConversations({ user, page: queryString.page, limit: queryString.limit });

export const getConversationDetails = ({ user, conversationId }) =>
  getConversationWithMessages({ user, conversationId });

export const removeConversation = ({ user, conversationId }) =>
  deleteConversation({ user, conversationId });

export const deleteConversationMessages = async (conversationId) => {
  await ChatMessage.deleteMany({ conversation: conversationId });
};

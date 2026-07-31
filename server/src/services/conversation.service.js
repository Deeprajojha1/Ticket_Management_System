import { v4 as uuidv4 } from "uuid";
import ChatMessage from "../models/ChatMessage.model.js";
import Conversation from "../models/Conversation.model.js";
import ApiError from "../utils/ApiError.js";
import { AI_CONVERSATION_STATUS, AI_MESSAGE_ROLES } from "../utils/constants.js";

export const getOrCreateConversation = async ({ user, conversationId }) => {
  if (conversationId) {
    const conversation = await Conversation.findOne({
      _id: conversationId,
      user: user._id,
      status: AI_CONVERSATION_STATUS.ACTIVE,
    });

    if (!conversation) {
      throw new ApiError(404, "Conversation not found");
    }

    return conversation;
  }

  return Conversation.create({
    user: user._id,
    sessionId: uuidv4(),
  });
};

export const addMessage = async ({ conversation, user, role, content, attachments = [], metadata = {} }) => {
  const message = await ChatMessage.create({
    conversation: conversation._id,
    user: user._id,
    role,
    content,
    attachments,
    metadata,
  });

  conversation.lastMessageAt = new Date();
  if (role === AI_MESSAGE_ROLES.USER && conversation.title === "New conversation") {
    conversation.title = content.slice(0, 80);
  }
  await conversation.save({ validateBeforeSave: false });

  return message;
};

export const getConversationHistory = async (conversationId, limit = 12) =>
  ChatMessage.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .then((messages) => messages.reverse());

export const listConversations = async ({ user, page = 1, limit = 10 }) => {
  const currentPage = Math.max(Number.parseInt(page, 10) || 1, 1);
  const pageLimit = Math.min(Math.max(Number.parseInt(limit, 10) || 10, 1), 100);
  const filter = { user: user._id, status: AI_CONVERSATION_STATUS.ACTIVE };
  const totalDocuments = await Conversation.countDocuments(filter);
  const conversations = await Conversation.find(filter)
    .sort({ lastMessageAt: -1 })
    .skip((currentPage - 1) * pageLimit)
    .limit(pageLimit)
    .lean();
  const totalPages = Math.ceil(totalDocuments / pageLimit) || 1;

  return {
    conversations,
    pagination: {
      totalDocuments,
      totalPages,
      currentPage,
      nextPage: currentPage < totalPages ? currentPage + 1 : null,
      previousPage: currentPage > 1 ? currentPage - 1 : null,
      limit: pageLimit,
    },
  };
};

export const getConversationWithMessages = async ({ user, conversationId }) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    user: user._id,
    status: AI_CONVERSATION_STATUS.ACTIVE,
  }).lean();

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  const messages = await ChatMessage.find({ conversation: conversation._id }).sort({ createdAt: 1 }).lean();
  return { conversation, messages };
};

export const deleteConversation = async ({ user, conversationId }) => {
  const conversation = await Conversation.findOneAndUpdate(
    { _id: conversationId, user: user._id },
    { status: AI_CONVERSATION_STATUS.DELETED },
    { new: true },
  );

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }
};

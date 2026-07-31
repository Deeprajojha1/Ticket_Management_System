import {
  getChatHistory,
  getConversationDetails,
  removeConversation,
  sendChatMessage,
  textToSpeech,
  transcribeAudio,
} from "../services/chat.service.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const chatController = asyncHandler(async (req, res) => {
  const result = await sendChatMessage({
    user: req.user,
    payload: req.body,
    files: req.files,
  });

  res.status(200).json(new ApiResponse(200, result, "AI reply generated successfully"));
});

export const transcribeController = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Audio file is required");
  }

  const result = await transcribeAudio({
    user: req.user,
    payload: req.body,
    file: req.file,
  });

  res.status(200).json(new ApiResponse(200, result, "Audio transcribed successfully"));
});

export const textToSpeechController = asyncHandler(async (req, res) => {
  const result = await textToSpeech({ text: req.body.text });

  res.status(200).json(new ApiResponse(200, result, "Speech generated successfully"));
});

export const historyController = asyncHandler(async (req, res) => {
  const result = await getChatHistory({ user: req.user, queryString: req.query });

  res.status(200).json(new ApiResponse(200, result, "Chat history fetched successfully"));
});

export const conversationController = asyncHandler(async (req, res) => {
  const result = await getConversationDetails({
    user: req.user,
    conversationId: req.params.conversationId,
  });

  res.status(200).json(new ApiResponse(200, result, "Conversation fetched successfully"));
});

export const deleteConversationController = asyncHandler(async (req, res) => {
  await removeConversation({
    user: req.user,
    conversationId: req.params.conversationId,
  });

  res.status(200).json(new ApiResponse(200, {}, "Conversation deleted successfully"));
});

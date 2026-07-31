import mongoose from "mongoose";
import { AI_CONVERSATION_STATUS } from "../utils/constants.js";

const conversationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      default: "New conversation",
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(AI_CONVERSATION_STATUS),
      default: AI_CONVERSATION_STATUS.ACTIVE,
      index: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

conversationSchema.index({ user: 1, sessionId: 1 });
conversationSchema.index({ user: 1, lastMessageAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;

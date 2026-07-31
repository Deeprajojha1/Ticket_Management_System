export const USER_ROLES = Object.freeze({
  CUSTOMER: "customer",
  AGENT: "agent",
});

export const COOKIE_NAMES = Object.freeze({
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
});

export const DEFAULT_ACCESS_TOKEN_EXPIRY = "15m";
export const DEFAULT_REFRESH_TOKEN_EXPIRY = "7d";

export const TICKET_CATEGORIES = Object.freeze({
  TECHNICAL: "Technical",
  BILLING: "Billing",
  REFUND: "Refund",
  ACCOUNT: "Account",
  GENERAL: "General",
  OTHER: "Other",
});

export const TICKET_STATUSES = Object.freeze({
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
});

export const TICKET_PRIORITIES = Object.freeze({
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
});

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;

export const AI_MESSAGE_ROLES = Object.freeze({
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
});

export const AI_CONVERSATION_STATUS = Object.freeze({
  ACTIVE: "active",
  DELETED: "deleted",
});

export const MAX_AI_CHAT_ATTACHMENTS = 5;
export const MAX_AI_CHAT_ATTACHMENT_SIZE = 5 * 1024 * 1024;
export const MAX_AI_AUDIO_SIZE = 15 * 1024 * 1024;

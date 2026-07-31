export const SOCKET_EVENTS = Object.freeze({
  JOIN_TICKET: "join-ticket",
  LEAVE_TICKET: "leave-ticket",
  TYPING_START: "typing-start",
  TYPING_STOP: "typing-stop",
  TICKET_CREATED: "ticket-created",
  TICKET_UPDATED: "ticket-updated",
  TICKET_DELETED: "ticket-deleted",
  TICKET_ASSIGNED: "ticket-assigned",
  STATUS_CHANGED: "status-changed",
  PRIORITY_CHANGED: "priority-changed",
  COMMENT_ADDED: "comment-added",
  COMMENT_DELETED: "comment-deleted",
  TYPING: "typing",
  USER_ONLINE: "user-online",
  USER_OFFLINE: "user-offline",
  SOCKET_ERROR: "socket-error",
});

export const SOCKET_ROOMS = Object.freeze({
  AGENT: "agent",
  user: (userId) => `user:${userId}`,
  ticket: (ticketId) => `ticket:${ticketId}`,
});


import Comment from "../models/Comment.model.js";
import Ticket from "../models/Ticket.model.js";
import APIFeatures from "../utils/APIFeatures.js";
import ApiError from "../utils/ApiError.js";
import {
  uploadAttachments,
  assertAgentCommentAccess,
  assertTicketAccess,
  getAttachmentStorageStream,
} from "./ticket.service.js";
import { getIO } from "../socket/socket.js";
import { SOCKET_EVENTS } from "../socket/socketConstants.js";
import { getTicketRoom, getUserRoom } from "../socket/socketRooms.js";
import { createAuditLog } from "./audit.service.js";
import { createNotifications } from "./notification.service.js";
import { TICKET_STATUSES } from "../utils/constants.js";

const populateComment = (query) =>
  query.populate("user", "fullName email role avatar");

const lockedConversationStatuses = new Set([TICKET_STATUSES.RESOLVED, TICKET_STATUSES.CLOSED]);

export const createComment = async ({ ticketId, payload, files, user }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false });
  assertTicketAccess(ticket, user);
  assertAgentCommentAccess(ticket, user);

  if (lockedConversationStatuses.has(ticket.status)) {
    throw new ApiError(403, "This ticket is resolved or closed. Conversation is locked.");
  }

  const attachments = await uploadAttachments(files, user._id);
  const comment = await Comment.create({
    ticket: ticket._id,
    user: user._id,
    message: payload.message,
    attachments,
  });

  ticket.lastActivity = new Date();
  ticket.activityLog.push({
    action: "Comment Added",
    actor: user._id,
    metadata: {
      comment: comment._id,
      attachmentCount: attachments.length,
    },
  });
  await ticket.save({ validateBeforeSave: false });

  const populatedComment = await populateComment(Comment.findById(comment._id));
  const socketPayload = { ticketId: ticket._id, comment: populatedComment };
  await createAuditLog({
    actor: user._id,
    action: "comment.created",
    entityType: "Comment",
    entityId: comment._id,
    ticket: ticket._id,
    after: populatedComment.toObject(),
  });
  await createNotifications([
    {
      recipient: ticket.createdBy,
      actor: user._id,
      ticket: ticket._id,
      type: "comment.created",
      title: "New comment",
      message: `A new comment was added to ticket ${ticket.ticketNumber}.`,
    },
    {
      recipient: ticket.assignedAgent,
      actor: user._id,
      ticket: ticket._id,
      type: "comment.created",
      title: "New comment",
      message: `A new comment was added to ticket ${ticket.ticketNumber}.`,
    },
  ]);

  const rooms = new Set([getTicketRoom(ticket._id), getUserRoom(ticket.createdBy)]);
  if (ticket.assignedAgent) rooms.add(getUserRoom(ticket.assignedAgent));
  getIO()?.to([...rooms]).emit(SOCKET_EVENTS.COMMENT_ADDED, socketPayload);

  return populatedComment;
};

export const getTicketComments = async ({ ticketId, queryString, user }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false });
  assertTicketAccess(ticket, user);

  const baseQuery = Comment.find({ ticket: ticket._id });
  const features = new APIFeatures(baseQuery, { ...queryString, sort: queryString.sort || "newest" }).sort();
  const totalDocuments = await Comment.countDocuments(features.query.getFilter());
  features.paginate(totalDocuments);
  const comments = await populateComment(features.query);

  return { comments, pagination: features.pagination };
};

export const getCommentAttachmentStream = async ({ ticketId, commentId, attachmentIndex, user }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false }).select("createdBy assignedAgent");
  assertTicketAccess(ticket, user);

  const comment = await Comment.findOne({ _id: commentId, ticket: ticket._id });
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const index = Number(attachmentIndex);
  const attachment = Number.isInteger(index) ? comment.attachments[index] : null;

  return getAttachmentStorageStream(attachment);
};

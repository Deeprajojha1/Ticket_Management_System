import mongoose from "mongoose";
import Ticket from "../models/Ticket.model.js";
import APIFeatures from "../utils/APIFeatures.js";
import ApiError from "../utils/ApiError.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";
import { TICKET_STATUSES, USER_ROLES } from "../utils/constants.js";
import { getIO } from "../socket/socket.js";
import { SOCKET_EVENTS } from "../socket/socketConstants.js";
import { getAgentRoom, getTicketRoom, getUserRoom } from "../socket/socketRooms.js";
import { createAuditLog } from "./audit.service.js";
import { sendTicketCreatedEmail, sendTicketResolvedEmail } from "./email.service.js";
import { createNotification, createNotifications } from "./notification.service.js";

const populateTicket = (query) =>
  query
    .populate("createdBy", "fullName email role avatar")
    .populate("assignedAgent", "fullName email role avatar")
    .populate("activityLog.actor", "fullName email role avatar");

const closedForCustomerMutation = new Set([
  TICKET_STATUSES.RESOLVED,
  TICKET_STATUSES.CLOSED,
]);

const normalizeTags = (tags) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 10);
};

const emitToAgents = (event, payload) => {
  getIO()?.to(getAgentRoom()).emit(event, payload);
};

const emitToTicket = (ticketId, event, payload) => {
  getIO()?.to(getTicketRoom(ticketId)).emit(event, payload);
};

const emitToUser = (userId, event, payload) => {
  getIO()?.to(getUserRoom(userId)).emit(event, payload);
};

export const uploadAttachments = async (files = [], userId) => {
  const uploadedFiles = await Promise.all(
    files.map(async (file) => {
      const attachment = await uploadBufferToCloudinary(file);
      return {
        ...attachment,
        uploadedBy: userId,
        uploadedAt: new Date(),
      };
    }),
  );

  return uploadedFiles;
};

export const assertTicketAccess = (ticket, user) => {
  if (!ticket || ticket.isDeleted) {
    throw new ApiError(404, "Ticket not found");
  }

  if (user.role === USER_ROLES.AGENT) {
    return;
  }

  if (ticket.createdBy.toString() !== user._id.toString()) {
    throw new ApiError(403, "You do not have access to this ticket");
  }
};

export const assertAgentCommentAccess = (ticket, user) => {
  if (user.role !== USER_ROLES.AGENT) {
    return;
  }

  if (!ticket.assignedAgent || ticket.assignedAgent.toString() !== user._id.toString()) {
    throw new ApiError(403, "Agents can comment only on tickets assigned to them");
  }
};

export const createTicket = async ({ payload, files, user }) => {
  const attachments = await uploadAttachments(files, user._id);

  const ticket = await Ticket.create({
    title: payload.title,
    description: payload.description,
    category: payload.category,
    priority: payload.priority,
    tags: normalizeTags(payload.tags),
    attachments,
    createdBy: user._id,
    activityLog: [
      {
        action: "Ticket Created",
        actor: user._id,
        metadata: { attachmentCount: attachments.length },
      },
    ],
  });

  const populatedTicket = await populateTicket(Ticket.findById(ticket._id));
  await createAuditLog({
    actor: user._id,
    action: "ticket.created",
    entityType: "Ticket",
    entityId: ticket._id,
    ticket: ticket._id,
    after: populatedTicket.toObject(),
  });
  await createNotification({
    recipient: user._id,
    actor: user._id,
    ticket: ticket._id,
    type: "ticket.created",
    title: "Ticket created",
    message: `Ticket ${ticket.ticketNumber} has been created.`,
  });
  sendTicketCreatedEmail(user, populatedTicket).catch(() => {});
  emitToAgents(SOCKET_EVENTS.TICKET_CREATED, { ticket: populatedTicket });
  emitToUser(user._id, SOCKET_EVENTS.TICKET_CREATED, { ticket: populatedTicket });

  return populatedTicket;
};

export const getMyTickets = async ({ queryString, user }) => {
  const baseFilter = { createdBy: user._id, isDeleted: false };
  const baseQuery = Ticket.find(baseFilter);
  const features = new APIFeatures(baseQuery, queryString)
    .search(["title", "description", "ticketNumber"])
    .filter(["status", "priority", "category", "assignedAgent"])
    .sort();

  const totalDocuments = await Ticket.countDocuments(features.query.getFilter());
  features.paginate(totalDocuments);
  const tickets = await populateTicket(features.query);

  return { tickets, pagination: features.pagination };
};

export const getAgentTickets = async ({ queryString }) => {
  const baseQuery = Ticket.find({ isDeleted: false });
  const features = new APIFeatures(baseQuery, queryString)
    .search(["title", "description", "ticketNumber"])
    .filter(["status", "priority", "category", "assignedAgent", "createdBy"])
    .sort();

  const totalDocuments = await Ticket.countDocuments(features.query.getFilter());
  features.paginate(totalDocuments);
  const tickets = await populateTicket(features.query);

  return { tickets, pagination: features.pagination };
};

export const getTicketById = async ({ ticketId, user }) => {
  const ticket = await populateTicket(Ticket.findById(ticketId));
  assertTicketAccess(ticket, user);
  return ticket;
};

export const updateCustomerTicket = async ({ ticketId, payload, files, user }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false });
  assertTicketAccess(ticket, user);

  if (closedForCustomerMutation.has(ticket.status)) {
    throw new ApiError(403, "Resolved or closed tickets cannot be updated by customers");
  }

  const attachments = await uploadAttachments(files, user._id);
  const mutableFields = ["title", "description", "category", "priority"];

  mutableFields.forEach((field) => {
    if (payload[field] !== undefined) {
      ticket[field] = payload[field];
    }
  });

  if (payload.tags !== undefined) {
    ticket.tags = normalizeTags(payload.tags);
  }

  if (attachments.length) {
    ticket.attachments.push(...attachments);
  }

  ticket.lastActivity = new Date();
  ticket.activityLog.push({
    action: "Ticket Updated",
    actor: user._id,
    metadata: { attachmentCount: attachments.length },
  });

  await ticket.save();
  const populatedTicket = await populateTicket(Ticket.findById(ticket._id));
  await createAuditLog({
    actor: user._id,
    action: "ticket.updated",
    entityType: "Ticket",
    entityId: ticket._id,
    ticket: ticket._id,
    metadata: { attachmentCount: attachments.length },
  });
  emitToTicket(ticket._id, SOCKET_EVENTS.TICKET_UPDATED, { ticket: populatedTicket });
  emitToAgents(SOCKET_EVENTS.TICKET_UPDATED, { ticket: populatedTicket });

  return populatedTicket;
};

export const deleteCustomerTicket = async ({ ticketId, user }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false });
  assertTicketAccess(ticket, user);

  if (closedForCustomerMutation.has(ticket.status)) {
    throw new ApiError(403, "Resolved or closed tickets cannot be deleted by customers");
  }

  ticket.isDeleted = true;
  ticket.lastActivity = new Date();
  ticket.activityLog.push({
    action: "Ticket Deleted",
    actor: user._id,
  });
  await ticket.save({ validateBeforeSave: false });
  await createAuditLog({
    actor: user._id,
    action: "ticket.deleted",
    entityType: "Ticket",
    entityId: ticket._id,
    ticket: ticket._id,
  });
  emitToTicket(ticket._id, SOCKET_EVENTS.TICKET_DELETED, { ticketId: ticket._id, ticketNumber: ticket.ticketNumber });
  emitToAgents(SOCKET_EVENTS.TICKET_DELETED, { ticketId: ticket._id, ticketNumber: ticket.ticketNumber });
};

export const updateTicketStatus = async ({ ticketId, status, user }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false });

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  const previousStatus = ticket.status;
  ticket.status = status;
  ticket.lastActivity = new Date();
  ticket.activityLog.push({
    action: "Status Changed",
    actor: user._id,
    from: previousStatus,
    to: status,
  });

  await ticket.save();
  const populatedTicket = await populateTicket(Ticket.findById(ticket._id));
  const payload = { ticket: populatedTicket, from: previousStatus, to: status };
  await createAuditLog({
    actor: user._id,
    action: "ticket.status_changed",
    entityType: "Ticket",
    entityId: ticket._id,
    ticket: ticket._id,
    before: { status: previousStatus },
    after: { status },
  });
  await createNotification({
    recipient: ticket.createdBy,
    actor: user._id,
    ticket: ticket._id,
    type: "ticket.status_changed",
    title: "Ticket status changed",
    message: `Ticket ${ticket.ticketNumber} changed from ${previousStatus} to ${status}.`,
  });
  if (status === TICKET_STATUSES.RESOLVED) {
    const customer = populatedTicket.createdBy;
    sendTicketResolvedEmail(customer, populatedTicket).catch(() => {});
  }

  emitToTicket(ticket._id, SOCKET_EVENTS.STATUS_CHANGED, payload);
  emitToUser(ticket.createdBy, SOCKET_EVENTS.STATUS_CHANGED, payload);
  if (ticket.assignedAgent) {
    emitToUser(ticket.assignedAgent, SOCKET_EVENTS.STATUS_CHANGED, payload);
  }

  return populatedTicket;
};

export const updateTicketPriority = async ({ ticketId, priority, user }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false });

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  const previousPriority = ticket.priority;
  ticket.priority = priority;
  ticket.lastActivity = new Date();
  ticket.activityLog.push({
    action: "Priority Changed",
    actor: user._id,
    from: previousPriority,
    to: priority,
  });

  await ticket.save();
  const populatedTicket = await populateTicket(Ticket.findById(ticket._id));
  const payload = { ticket: populatedTicket, from: previousPriority, to: priority };
  await createAuditLog({
    actor: user._id,
    action: "ticket.priority_changed",
    entityType: "Ticket",
    entityId: ticket._id,
    ticket: ticket._id,
    before: { priority: previousPriority },
    after: { priority },
  });
  await createNotification({
    recipient: ticket.createdBy,
    actor: user._id,
    ticket: ticket._id,
    type: "ticket.priority_changed",
    title: "Ticket priority changed",
    message: `Ticket ${ticket.ticketNumber} priority changed from ${previousPriority} to ${priority}.`,
  });

  emitToTicket(ticket._id, SOCKET_EVENTS.PRIORITY_CHANGED, payload);
  emitToUser(ticket.createdBy, SOCKET_EVENTS.PRIORITY_CHANGED, payload);
  if (ticket.assignedAgent) {
    emitToUser(ticket.assignedAgent, SOCKET_EVENTS.PRIORITY_CHANGED, payload);
  }

  return populatedTicket;
};

export const assignTicketToSelf = async ({ ticketId, user }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false });

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  const previousAgent = ticket.assignedAgent;
  ticket.assignedAgent = user._id;
  ticket.lastActivity = new Date();
  ticket.activityLog.push({
    action: "Assigned to Agent",
    actor: user._id,
    from: previousAgent instanceof mongoose.Types.ObjectId ? previousAgent.toString() : null,
    to: user._id.toString(),
  });

  await ticket.save({ validateBeforeSave: false });
  const populatedTicket = await populateTicket(Ticket.findById(ticket._id));
  const payload = { ticket: populatedTicket, assignedAgent: user };
  await createAuditLog({
    actor: user._id,
    action: "ticket.assigned",
    entityType: "Ticket",
    entityId: ticket._id,
    ticket: ticket._id,
    before: { assignedAgent: previousAgent },
    after: { assignedAgent: user._id },
  });
  await createNotifications([
    {
      recipient: user._id,
      actor: user._id,
      ticket: ticket._id,
      type: "ticket.assigned",
      title: "Ticket assigned to you",
      message: `Ticket ${ticket.ticketNumber} has been assigned to you.`,
    },
    {
      recipient: ticket.createdBy,
      actor: user._id,
      ticket: ticket._id,
      type: "ticket.assigned",
      title: "Ticket assigned",
      message: `Ticket ${ticket.ticketNumber} has been assigned to an agent.`,
    },
  ]);

  emitToTicket(ticket._id, SOCKET_EVENTS.TICKET_ASSIGNED, payload);
  emitToUser(user._id, SOCKET_EVENTS.TICKET_ASSIGNED, payload);
  emitToUser(ticket.createdBy, SOCKET_EVENTS.TICKET_ASSIGNED, payload);

  return populatedTicket;
};

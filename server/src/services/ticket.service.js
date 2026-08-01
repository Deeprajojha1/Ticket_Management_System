import axios from "axios";
import mongoose from "mongoose";
import Ticket from "../models/Ticket.model.js";
import User from "../models/User.model.js";
import APIFeatures from "../utils/APIFeatures.js";
import ApiError from "../utils/ApiError.js";
import cloudinary, { uploadBufferToCloudinary } from "../utils/cloudinary.js";
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

const toEntityId = (value) => {
  if (!value) {
    return null;
  }

  if (value._id) {
    return value._id.toString();
  }

  return value.toString();
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

const uniqueValues = (values) => [...new Set(values.filter(Boolean))];

const getAttachmentResourceTypes = (attachment) => {
  if (attachment.resourceType) {
    return uniqueValues([attachment.resourceType, "raw", "image"]);
  }

  if (attachment.mimeType === "application/pdf") {
    return ["raw", "image"];
  }

  if (attachment.mimeType?.startsWith("image/")) {
    return ["image", "raw"];
  }

  return ["raw", "image"];
};

const getAttachmentFormat = (attachment) => {
  const fromName = attachment.originalName?.split(".").pop()?.toLowerCase();
  const fromUrl = attachment.url?.split("?")[0]?.split(".").pop()?.toLowerCase();
  const format = fromName || fromUrl;

  return format && format.length <= 10 ? format : undefined;
};

const buildAttachmentDeliveryUrls = (attachment) => {
  const candidateUrls = [attachment.url];
  const format = getAttachmentFormat(attachment);

  if (attachment.public_id) {
    getAttachmentResourceTypes(attachment).forEach((resourceType) => {
      candidateUrls.push(
        cloudinary.url(attachment.public_id, {
          resource_type: resourceType,
          secure: true,
        }),
      );
      candidateUrls.push(
        cloudinary.url(attachment.public_id, {
          resource_type: resourceType,
          secure: true,
          sign_url: true,
        }),
      );

      if (cloudinary.utils?.private_download_url && format) {
        candidateUrls.push(
          cloudinary.utils.private_download_url(attachment.public_id, format, {
            resource_type: resourceType,
            type: "upload",
            attachment: false,
            secure: true,
          }),
        );
      }
    });
  }

  return uniqueValues(candidateUrls);
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

  if (toEntityId(ticket.createdBy) !== user._id.toString()) {
    throw new ApiError(403, "You do not have access to this ticket");
  }
};

export const assertAgentCommentAccess = (ticket, user) => {
  if (user.role !== USER_ROLES.AGENT) {
    return;
  }

  if (!ticket.assignedAgent || toEntityId(ticket.assignedAgent) !== user._id.toString()) {
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

export const getAttachmentStorageStream = async (attachment) => {
  if (!attachment?.url) {
    throw new ApiError(404, "Attachment not found");
  }

  const deliveryUrls = buildAttachmentDeliveryUrls(attachment);
  const failedStatuses = [];

  for (const url of deliveryUrls) {
    try {
      const response = await axios.get(url, {
        responseType: "stream",
        timeout: 20000,
        validateStatus: (status) => status >= 200 && status < 300,
      });

      return {
        stream: response.data,
        attachment,
        contentType: response.headers["content-type"] || attachment.mimeType || "application/octet-stream",
        contentLength: response.headers["content-length"],
      };
    } catch (error) {
      failedStatuses.push(error.response?.status || error.code || "network-error");
      // Try the next possible Cloudinary delivery URL for legacy image/raw uploads.
    }
  }

  throw new ApiError(
    502,
    `Attachment file could not be loaded from storage${failedStatuses.length ? ` (${failedStatuses.join(", ")})` : ""}`,
  );
};

export const getTicketAttachmentStream = async ({ ticketId, attachmentIndex, user }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false }).select("createdBy assignedAgent attachments");
  assertTicketAccess(ticket, user);

  const index = Number(attachmentIndex);
  const attachment = Number.isInteger(index) ? ticket.attachments[index] : null;

  return getAttachmentStorageStream(attachment);
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

export const getAssignableAgents = async () =>
  User.find({ role: USER_ROLES.AGENT, isActive: true })
    .select("fullName email role avatar")
    .sort({ fullName: 1 });

export const assignTicketToAgent = async ({ ticketId, user, agentId }) => {
  const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false });

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  const targetAgentId = agentId || user._id;
  const targetAgent = await User.findOne({
    _id: targetAgentId,
    role: USER_ROLES.AGENT,
    isActive: true,
  }).select("fullName email role avatar");

  if (!targetAgent) {
    throw new ApiError(404, "Agent not found");
  }

  const previousAgent = ticket.assignedAgent;
  ticket.assignedAgent = targetAgent._id;
  ticket.lastActivity = new Date();
  ticket.activityLog.push({
    action: "Assigned to Agent",
    actor: user._id,
    from: previousAgent instanceof mongoose.Types.ObjectId ? previousAgent.toString() : null,
    to: targetAgent._id.toString(),
  });

  await ticket.save({ validateBeforeSave: false });
  const populatedTicket = await populateTicket(Ticket.findById(ticket._id));
  const payload = { ticket: populatedTicket, assignedAgent: targetAgent };
  await createAuditLog({
    actor: user._id,
    action: "ticket.assigned",
    entityType: "Ticket",
    entityId: ticket._id,
    ticket: ticket._id,
    before: { assignedAgent: previousAgent },
    after: { assignedAgent: targetAgent._id },
  });
  await createNotifications([
    {
      recipient: targetAgent._id,
      actor: user._id,
      ticket: ticket._id,
      type: "ticket.assigned",
      title: targetAgent._id.equals(user._id) ? "Ticket assigned to you" : "Ticket assigned",
      message: targetAgent._id.equals(user._id)
        ? `Ticket ${ticket.ticketNumber} has been assigned to you.`
        : `Ticket ${ticket.ticketNumber} has been assigned to ${targetAgent.fullName}.`,
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
  emitToUser(targetAgent._id, SOCKET_EVENTS.TICKET_ASSIGNED, payload);
  emitToUser(ticket.createdBy, SOCKET_EVENTS.TICKET_ASSIGNED, payload);

  return populatedTicket;
};

export const assignTicketToSelf = ({ ticketId, user }) => assignTicketToAgent({ ticketId, user });

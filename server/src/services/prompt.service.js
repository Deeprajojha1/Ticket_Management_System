import Comment from "../models/Comment.model.js";
import Ticket from "../models/Ticket.model.js";
import { attachmentSummary } from "../utils/aiResponseFormatter.js";
import { TICKET_STATUSES } from "../utils/constants.js";
import {
  buildConversationPrompt,
  buildCustomerTicketContextPrompt,
} from "../utils/promptTemplates.js";

const RECENT_TICKET_LIMIT = 8;
const STATUS_LIST_LIMIT = 10;
const LATEST_COMMENT_LIMIT = 8;

const ticketReadFields = "ticketNumber title status priority category createdAt updatedAt lastActivity";

const mapTicketForContext = (ticket) => ({
  ticketNumber: ticket.ticketNumber,
  title: ticket.title,
  status: ticket.status,
  priority: ticket.priority,
  category: ticket.category,
  createdAt: ticket.createdAt,
  updatedAt: ticket.updatedAt,
  lastActivity: ticket.lastActivity,
});

export const getCustomerTicketContext = async (user) => {
  const customerTicketFilter = { createdBy: user._id, isDeleted: false };
  const openStatuses = [TICKET_STATUSES.OPEN, TICKET_STATUSES.IN_PROGRESS];
  const resolvedStatuses = [TICKET_STATUSES.RESOLVED, TICKET_STATUSES.CLOSED];

  const [recentTickets, openTickets, resolvedTickets, customerTicketRefs, totalTickets] = await Promise.all([
    Ticket.find(customerTicketFilter)
      .sort({ lastActivity: -1, createdAt: -1 })
      .limit(RECENT_TICKET_LIMIT)
      .select(ticketReadFields)
      .lean(),
    Ticket.find({ ...customerTicketFilter, status: { $in: openStatuses } })
      .sort({ lastActivity: -1, createdAt: -1 })
      .limit(STATUS_LIST_LIMIT)
      .select(ticketReadFields)
      .lean(),
    Ticket.find({ ...customerTicketFilter, status: { $in: resolvedStatuses } })
      .sort({ lastActivity: -1, createdAt: -1 })
      .limit(STATUS_LIST_LIMIT)
      .select(ticketReadFields)
      .lean(),
    Ticket.find(customerTicketFilter).select("_id").lean(),
    Ticket.countDocuments(customerTicketFilter),
  ]);

  const customerTicketIds = customerTicketRefs.map((ticket) => ticket._id);
  const comments = customerTicketIds.length
    ? await Comment.find({ ticket: { $in: customerTicketIds } })
        .sort({ createdAt: -1 })
        .limit(LATEST_COMMENT_LIMIT)
        .populate("ticket", "ticketNumber title status")
        .select("message ticket createdAt")
        .lean()
    : [];

  return {
    customerName: user.fullName || user.email,
    customerId: user._id.toString(),
    totalTickets,
    recentTickets: recentTickets.map(mapTicketForContext),
    openTickets: openTickets.map(mapTicketForContext),
    resolvedTickets: resolvedTickets.map(mapTicketForContext),
    latestComments: comments.map((comment) => ({
      ticketNumber: comment.ticket?.ticketNumber,
      ticketTitle: comment.ticket?.title,
      ticketStatus: comment.ticket?.status,
      message: comment.message,
      createdAt: comment.createdAt,
    })),
  };
};

export const buildSupportPrompt = async ({ user, history, message, attachments }) => {
  const ticketContext = await getCustomerTicketContext(user);
  const customerContextPrompt = buildCustomerTicketContextPrompt(ticketContext);

  return {
    customerContext: ticketContext,
    prompt: buildConversationPrompt({
      customerContextPrompt,
      history,
      userMessage: message,
      attachmentSummary: attachmentSummary(attachments),
    }),
  };
};

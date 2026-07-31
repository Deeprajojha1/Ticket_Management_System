import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  assignTicketToSelf,
  createTicket,
  deleteCustomerTicket,
  getAgentTickets,
  getMyTickets,
  getTicketAttachmentStream,
  getTicketById,
  updateCustomerTicket,
  updateTicketPriority,
  updateTicketStatus,
} from "../services/ticket.service.js";

const safeFilename = (filename = "attachment") =>
  filename
    .replace(/[^\w.\-() ]/g, "_")
    .replace(/\s+/g, " ")
    .trim() || "attachment";

export const createTicketController = asyncHandler(async (req, res) => {
  const ticket = await createTicket({ payload: req.body, files: req.files, user: req.user });

  res.status(201).json(new ApiResponse(201, { ticket }, "Ticket created successfully"));
});

export const getMyTicketsController = asyncHandler(async (req, res) => {
  const result = await getMyTickets({ queryString: req.query, user: req.user });

  res.status(200).json(new ApiResponse(200, result, "Tickets fetched successfully"));
});

export const getAgentTicketsController = asyncHandler(async (req, res) => {
  const result = await getAgentTickets({ queryString: req.query });

  res.status(200).json(new ApiResponse(200, result, "Tickets fetched successfully"));
});

export const getTicketByIdController = asyncHandler(async (req, res) => {
  const ticket = await getTicketById({ ticketId: req.params.id, user: req.user });

  res.status(200).json(new ApiResponse(200, { ticket }, "Ticket fetched successfully"));
});

export const openTicketAttachmentController = asyncHandler(async (req, res) => {
  const { stream, attachment, contentType, contentLength } = await getTicketAttachmentStream({
    ticketId: req.params.id,
    attachmentIndex: req.params.index,
    user: req.user,
  });

  if (contentLength) {
    res.setHeader("Content-Length", contentLength);
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `inline; filename="${safeFilename(attachment.originalName)}"`);
  stream.pipe(res);
});

export const downloadTicketAttachmentController = asyncHandler(async (req, res) => {
  const { stream, attachment, contentType, contentLength } = await getTicketAttachmentStream({
    ticketId: req.params.id,
    attachmentIndex: req.params.index,
    user: req.user,
  });

  if (contentLength) {
    res.setHeader("Content-Length", contentLength);
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${safeFilename(attachment.originalName)}"`);
  stream.pipe(res);
});

export const updateTicketController = asyncHandler(async (req, res) => {
  const ticket = await updateCustomerTicket({
    ticketId: req.params.id,
    payload: req.body,
    files: req.files,
    user: req.user,
  });

  res.status(200).json(new ApiResponse(200, { ticket }, "Ticket updated successfully"));
});

export const deleteTicketController = asyncHandler(async (req, res) => {
  await deleteCustomerTicket({ ticketId: req.params.id, user: req.user });

  res.status(200).json(new ApiResponse(200, {}, "Ticket deleted successfully"));
});

export const updateTicketStatusController = asyncHandler(async (req, res) => {
  const ticket = await updateTicketStatus({
    ticketId: req.params.id,
    status: req.body.status,
    user: req.user,
  });

  res.status(200).json(new ApiResponse(200, { ticket }, "Ticket status updated successfully"));
});

export const updateTicketPriorityController = asyncHandler(async (req, res) => {
  const ticket = await updateTicketPriority({
    ticketId: req.params.id,
    priority: req.body.priority,
    user: req.user,
  });

  res.status(200).json(new ApiResponse(200, { ticket }, "Ticket priority updated successfully"));
});

export const assignTicketController = asyncHandler(async (req, res) => {
  const ticket = await assignTicketToSelf({ ticketId: req.params.id, user: req.user });

  res.status(200).json(new ApiResponse(200, { ticket }, "Ticket assigned successfully"));
});

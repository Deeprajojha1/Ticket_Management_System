import Ticket from "../models/Ticket.model.js";
import ApiError from "../utils/ApiError.js";
import { USER_ROLES } from "../utils/constants.js";
import { SOCKET_ROOMS } from "./socketConstants.js";
import mongoose from "mongoose";

export const getUserRoom = (userId) => SOCKET_ROOMS.user(userId);
export const getTicketRoom = (ticketId) => SOCKET_ROOMS.ticket(ticketId);
export const getAgentRoom = () => SOCKET_ROOMS.AGENT;

export const canAccessTicketRoom = async ({ ticketId, user }) => {
  if (!ticketId) {
    throw new ApiError(400, "Ticket id is required");
  }

  if (!mongoose.isValidObjectId(ticketId)) {
    throw new ApiError(400, "Invalid ticket id");
  }

  const ticket = await Ticket.findOne({ _id: ticketId, isDeleted: false }).select("createdBy assignedAgent");

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  if (user.role === USER_ROLES.AGENT) {
    return true;
  }

  if (ticket.createdBy.toString() !== user._id.toString()) {
    throw new ApiError(403, "You do not have access to this ticket room");
  }

  return true;
};

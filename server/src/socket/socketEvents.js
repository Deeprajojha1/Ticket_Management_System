import { SOCKET_EVENTS } from "./socketConstants.js";
import { canAccessTicketRoom, getTicketRoom } from "./socketRooms.js";

const socketErrorPayload = (error) => ({
  message: error.message || "Socket event failed",
  statusCode: error.statusCode || 500,
});

export const registerSocketEvents = (io, socket, presenceStore) => {
  socket.on(SOCKET_EVENTS.JOIN_TICKET, async ({ ticketId } = {}) => {
    try {
      await canAccessTicketRoom({ ticketId, user: socket.user });
      const room = getTicketRoom(ticketId);
      socket.join(room);
      console.log(`Socket room joined: ${socket.id} -> ${room}`);
    } catch (error) {
      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, socketErrorPayload(error));
    }
  });

  socket.on(SOCKET_EVENTS.LEAVE_TICKET, ({ ticketId } = {}) => {
    if (!ticketId) {
      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, { message: "Ticket id is required", statusCode: 400 });
      return;
    }

    const room = getTicketRoom(ticketId);
    socket.leave(room);
    console.log(`Socket room left: ${socket.id} -> ${room}`);
  });

  const emitTyping = async ({ ticketId } = {}, isTyping) => {
    try {
      await canAccessTicketRoom({ ticketId, user: socket.user });
      socket.to(getTicketRoom(ticketId)).emit(SOCKET_EVENTS.TYPING, {
        ticketId,
        user: {
          _id: socket.user._id,
          fullName: socket.user.fullName,
          role: socket.user.role,
        },
        isTyping,
      });
    } catch (error) {
      socket.emit(SOCKET_EVENTS.SOCKET_ERROR, socketErrorPayload(error));
    }
  };

  socket.on(SOCKET_EVENTS.TYPING_START, (payload) => emitTyping(payload, true));
  socket.on(SOCKET_EVENTS.TYPING_STOP, (payload) => emitTyping(payload, false));

  socket.on("disconnecting", () => {
    console.log(`Socket disconnecting: ${socket.id}`);
  });

  socket.on("disconnect", (reason) => {
    const userId = socket.user._id.toString();
    const userSockets = presenceStore.onlineUsers.get(userId);

    if (userSockets) {
      userSockets.delete(socket.id);

      if (userSockets.size === 0) {
        presenceStore.onlineUsers.delete(userId);
        io.emit(SOCKET_EVENTS.USER_OFFLINE, { userId, reason });
      }
    }

    console.log(`Socket disconnected: ${socket.id} (${reason})`);
  });
};


import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "./useSocket.js";
import { SOCKET_EVENTS } from "../socket/socketEvents.js";

export const useTyping = (ticketId) => {
  const { socket } = useSocket() || {};
  const [typingUser, setTypingUser] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!socket || !ticketId) return undefined;

    const onTyping = (payload) => {
      if (payload.ticketId !== ticketId) return;
      setTypingUser(payload.isTyping ? payload.user : null);
    };

    socket.emit(SOCKET_EVENTS.JOIN_TICKET, { ticketId });
    socket.on(SOCKET_EVENTS.TYPING, onTyping);

    return () => {
      socket.emit(SOCKET_EVENTS.LEAVE_TICKET, { ticketId });
      socket.off(SOCKET_EVENTS.TYPING, onTyping);
    };
  }, [socket, ticketId]);

  const emitTyping = useCallback(() => {
    if (!socket || !ticketId) return;
    socket.emit(SOCKET_EVENTS.TYPING_START, { ticketId });
    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      socket.emit(SOCKET_EVENTS.TYPING_STOP, { ticketId });
    }, 1400);
  }, [socket, ticketId]);

  const stopTyping = useCallback(() => {
    if (!socket || !ticketId) return;
    window.clearTimeout(timeoutRef.current);
    socket.emit(SOCKET_EVENTS.TYPING_STOP, { ticketId });
  }, [socket, ticketId]);

  return { emitTyping, stopTyping, typingUser };
};

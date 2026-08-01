import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { dashboardApi } from "../features/agent/services/dashboardApi.js";
import { ticketApi } from "../features/tickets/services/ticketApi.js";
import { useAuth } from "../hooks/useAuth.js";
import axiosInstance from "../utils/axiosInstance.js";
import { createSocket, disconnectSocket } from "./socket.js";
import { SocketContext } from "./socketContext.js";
import { SOCKET_EVENTS } from "./socketEvents.js";

const invalidateLiveData = (dispatch) => {
  dispatch(ticketApi.util.invalidateTags(["Tickets", "Ticket", "Comments"]));
  dispatch(dashboardApi.util.invalidateTags(["AgentOverview", "AgentTickets", "AgentActivity", "Notifications"]));
};

const getEntityId = (value) => value?._id || value?.id || value?.toString?.();

const updateCommentCache = (dispatch, payload = {}, action = "add") => {
  const ticketId = getEntityId(payload.ticketId);
  const comment = payload.comment;
  if (!ticketId || !comment?._id) return;

  dispatch(
    ticketApi.util.updateQueryData("getComments", { ticketId, page: 1, limit: 50, sort: "oldest" }, (draft) => {
      const comments = draft?.data?.comments;
      if (!Array.isArray(comments)) return;

      const existingIndex = comments.findIndex((item) => item._id === comment._id);
      if (action === "delete") {
        if (existingIndex >= 0) comments.splice(existingIndex, 1);
        if (draft.data?.pagination?.totalDocuments !== undefined) {
          draft.data.pagination.totalDocuments = Math.max(draft.data.pagination.totalDocuments - 1, 0);
        }
        return;
      }

      if (existingIndex >= 0) {
        comments[existingIndex] = comment;
        return;
      }

      comments.push(comment);
      if (draft.data?.pagination?.totalDocuments !== undefined) {
        draft.data.pagination.totalDocuments += 1;
      }
    }),
  );
};

const prependNotificationCache = (dispatch, notification) => {
  if (!notification?._id) return;

  dispatch(
    dashboardApi.util.updateQueryData("notifications", { page: 1, limit: 8 }, (draft) => {
      const notifications = draft?.data?.notifications;
      if (!Array.isArray(notifications)) return;

      const exists = notifications.some((item) => item._id === notification._id);
      if (exists) return;

      notifications.unshift(notification);
      notifications.splice(8);

      if (draft.data?.pagination?.totalDocuments !== undefined) {
        draft.data.pagination.totalDocuments += 1;
      }
    }),
  );
};

const requestBrowserNotification = (title, body) => {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(title, { body });
    return;
  }
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
};

const playNotificationSound = () => {
  const audio = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YQAAAAA=");
  audio.volume = 0.15;
  audio.play().catch(() => {});
};

const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();
  const [connectionState, setConnectionState] = useState("disconnected");
  const [onlineUsers, setOnlineUsers] = useState({});
  const socket = useMemo(() => createSocket(), []);

  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated) {
      disconnectSocket();
      window.queueMicrotask(() => setConnectionState("disconnected"));
      return;
    }

    const connectWithSocketToken = async () => {
      try {
        const response = await axiosInstance.get("/auth/socket-token");
        if (!isMounted) return;

        socket.auth = { token: response.data?.data?.token };
        socket.connect();
      } catch (error) {
        if (!isMounted) return;

        console.error("Socket token request failed:", error.response?.data?.message || error.message);
        socket.auth = {};
        socket.connect();
      }
    };

    window.queueMicrotask(() => setConnectionState("connecting"));
    connectWithSocketToken();

    const onConnect = () => {
      setConnectionState("connected");
      toast.success("Realtime connected");
    };
    const onDisconnect = () => {
      setConnectionState(navigator.onLine ? "disconnected" : "offline");
      toast.error("Realtime connection lost");
    };
    const onConnectError = (error) => {
      setConnectionState("reconnecting");
      console.error("Realtime connection failed:", error.message);
    };
    const onReconnectAttempt = () => setConnectionState("reconnecting");
    const onReconnect = () => {
      setConnectionState("connected");
      toast.success("Realtime reconnected");
      invalidateLiveData(dispatch);
    };
    const onOnline = ({ userId }) => setOnlineUsers((current) => ({ ...current, [userId]: { online: true, lastSeen: null } }));
    const onOffline = ({ userId }) =>
      setOnlineUsers((current) => ({ ...current, [userId]: { online: false, lastSeen: new Date().toISOString() } }));
    const onLiveTicket = (payload = {}) => {
      invalidateLiveData(dispatch);
      const ticketNumber = payload.ticket?.ticketNumber || payload.ticketNumber || "ticket";
      toast.success(`Live update: ${ticketNumber}`);
      if (payload.ticket) requestBrowserNotification("SupportDesk AI", `Ticket updated: ${ticketNumber}`);
      if (payload.ticket) playNotificationSound();
    };
    const onComment = (payload = {}) => {
      updateCommentCache(dispatch, payload, "add");
      dispatch(ticketApi.util.invalidateTags(["Tickets", { type: "Ticket", id: getEntityId(payload.ticketId) }]));
      dispatch(dashboardApi.util.invalidateTags(["AgentOverview", "AgentTickets", "AgentActivity", "Notifications"]));
      const authorId = getEntityId(payload.comment?.user);
      const commentId = getEntityId(payload.comment);
      const currentUserId = getEntityId(user);

      if (authorId && authorId === currentUserId) return;

      toast.success("New comment received", { id: commentId ? `comment-${commentId}` : "comment-received" });
      requestBrowserNotification("New comment", payload.comment?.message || "A ticket has a new comment");
      playNotificationSound();
    };
    const onCommentDeleted = (payload = {}) => {
      updateCommentCache(dispatch, payload, "delete");
      dispatch(ticketApi.util.invalidateTags(["Tickets", { type: "Ticket", id: getEntityId(payload.ticketId) }]));
      dispatch(dashboardApi.util.invalidateTags(["AgentOverview", "AgentTickets", "AgentActivity", "Notifications"]));
    };
    const onNotification = (payload = {}) => {
      const notification = payload.notification;
      const notificationId = getEntityId(notification);

      prependNotificationCache(dispatch, notification);
      dispatch(dashboardApi.util.invalidateTags(["Notifications", "AgentOverview", "AgentActivity"]));

      if (notification?.type === "comment.created") return;

      toast.success(notification?.title || "New notification", { id: notificationId ? `notification-${notificationId}` : undefined });
      requestBrowserNotification(payload.notification?.title || "SupportDesk AI", payload.notification?.message || "");
      playNotificationSound();
    };
    const onSocketError = (error) => toast.error(error?.message || "Realtime event failed");
    const onNetworkOffline = () => setConnectionState("offline");
    const onNetworkOnline = () => {
      setConnectionState(socket.connected ? "connected" : "reconnecting");
      if (!socket.connected) connectWithSocketToken();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.io.on("reconnect_attempt", onReconnectAttempt);
    socket.io.on("reconnect", onReconnect);
    socket.on(SOCKET_EVENTS.USER_ONLINE, onOnline);
    socket.on(SOCKET_EVENTS.USER_OFFLINE, onOffline);
    socket.on(SOCKET_EVENTS.TICKET_CREATED, onLiveTicket);
    socket.on(SOCKET_EVENTS.TICKET_UPDATED, onLiveTicket);
    socket.on(SOCKET_EVENTS.TICKET_DELETED, onLiveTicket);
    socket.on(SOCKET_EVENTS.TICKET_ASSIGNED, onLiveTicket);
    socket.on(SOCKET_EVENTS.STATUS_CHANGED, onLiveTicket);
    socket.on(SOCKET_EVENTS.PRIORITY_CHANGED, onLiveTicket);
    socket.on(SOCKET_EVENTS.COMMENT_ADDED, onComment);
    socket.on(SOCKET_EVENTS.COMMENT_DELETED, onCommentDeleted);
    socket.on(SOCKET_EVENTS.NOTIFICATION_CREATED, onNotification);
    socket.on(SOCKET_EVENTS.SOCKET_ERROR, onSocketError);
    window.addEventListener("offline", onNetworkOffline);
    window.addEventListener("online", onNetworkOnline);

    if (user?._id) {
      window.queueMicrotask(() => {
        setOnlineUsers((current) => ({ ...current, [user._id]: { online: true, lastSeen: null } }));
      });
    }

    return () => {
      isMounted = false;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.io.off("reconnect_attempt", onReconnectAttempt);
      socket.io.off("reconnect", onReconnect);
      socket.off(SOCKET_EVENTS.USER_ONLINE, onOnline);
      socket.off(SOCKET_EVENTS.USER_OFFLINE, onOffline);
      socket.off(SOCKET_EVENTS.TICKET_CREATED, onLiveTicket);
      socket.off(SOCKET_EVENTS.TICKET_UPDATED, onLiveTicket);
      socket.off(SOCKET_EVENTS.TICKET_DELETED, onLiveTicket);
      socket.off(SOCKET_EVENTS.TICKET_ASSIGNED, onLiveTicket);
      socket.off(SOCKET_EVENTS.STATUS_CHANGED, onLiveTicket);
      socket.off(SOCKET_EVENTS.PRIORITY_CHANGED, onLiveTicket);
      socket.off(SOCKET_EVENTS.COMMENT_ADDED, onComment);
      socket.off(SOCKET_EVENTS.COMMENT_DELETED, onCommentDeleted);
      socket.off(SOCKET_EVENTS.NOTIFICATION_CREATED, onNotification);
      socket.off(SOCKET_EVENTS.SOCKET_ERROR, onSocketError);
      window.removeEventListener("offline", onNetworkOffline);
      window.removeEventListener("online", onNetworkOnline);
    };
  }, [dispatch, isAuthenticated, socket, user?._id]);

  const value = useMemo(() => ({ connectionState, onlineUsers, socket }), [connectionState, onlineUsers, socket]);

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export default SocketProvider;

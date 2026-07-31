import { Server } from "socket.io";
import { authenticateSocket } from "./socketAuth.js";
import { SOCKET_EVENTS } from "./socketConstants.js";
import { registerSocketEvents } from "./socketEvents.js";

let ioInstance = null;

const presenceStore = {
  onlineUsers: new Map(),
};

export const initializeSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  ioInstance.use(authenticateSocket);

  ioInstance.on("connection", (socket) => {
    const userId = socket.user._id.toString();
    const userSockets = presenceStore.onlineUsers.get(userId) || new Set();
    const wasOffline = userSockets.size === 0;

    userSockets.add(socket.id);
    presenceStore.onlineUsers.set(userId, userSockets);

    if (wasOffline) {
      ioInstance.emit(SOCKET_EVENTS.USER_ONLINE, { userId });
    }

    console.log(`Socket connected: ${socket.id} user:${userId}`);
    registerSocketEvents(ioInstance, socket, presenceStore);
  });

  return ioInstance;
};

export const getIO = () => ioInstance;
export const getOnlineUsers = () => presenceStore.onlineUsers;

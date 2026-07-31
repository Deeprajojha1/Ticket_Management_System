import { io } from "socket.io-client";

let socketInstance = null;

export const createSocket = () => {
  if (socketInstance) return socketInstance;

  socketInstance = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 800,
    reconnectionDelayMax: 5000,
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  return socketInstance;
};

export const getSocket = () => socketInstance || createSocket();

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
  }
};

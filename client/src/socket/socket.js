import { io } from "socket.io-client";

let socketInstance = null;

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v\d+\/?$/, "");
  }

  return "http://localhost:5000";
};

export const createSocket = () => {
  if (socketInstance) return socketInstance;

  socketInstance = io(getSocketUrl(), {
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

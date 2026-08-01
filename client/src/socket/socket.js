import { io } from "socket.io-client";

let socketInstance = null;

const toSocketOrigin = (value) => {
  try {
    return new URL(value).origin;
  } catch (_error) {
    return value;
  }
};

const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return toSocketOrigin(import.meta.env.VITE_SOCKET_URL);
  }

  if (import.meta.env.VITE_API_BASE_URL) {
    return toSocketOrigin(import.meta.env.VITE_API_BASE_URL);
  }

  return "http://localhost:5000";
};

export const createSocket = () => {
  if (socketInstance) {
    socketInstance.io.opts.reconnection = true;
    return socketInstance;
  }

  socketInstance = io(getSocketUrl(), {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 800,
    reconnectionDelayMax: 5000,
    withCredentials: true,
    transports: ["polling", "websocket"],
  });

  return socketInstance;
};

export const getSocket = () => socketInstance || createSocket();

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.io.opts.reconnection = false;
    socketInstance.auth = {};
    socketInstance.disconnect();
  }
};

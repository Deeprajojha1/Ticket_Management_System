import { useSocket } from "./useSocket.js";

export const useOnlineUsers = () => {
  const context = useSocket();
  return context?.onlineUsers || {};
};

import { useContext } from "react";
import { SocketContext } from "../socket/socketContext.js";

export const useSocket = () => useContext(SocketContext);

import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { COOKIE_NAMES, USER_ROLES } from "../utils/constants.js";
import { getAgentRoom, getUserRoom } from "./socketRooms.js";

const parseCookies = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((cookies, cookie) => {
    const [rawName, ...rawValue] = cookie.trim().split("=");
    if (!rawName || rawValue.length === 0) {
      return cookies;
    }

    cookies[rawName] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});

export const authenticateSocket = async (socket, next) => {
  try {
    const cookies = parseCookies(socket.handshake.headers.cookie);
    const token = socket.handshake.auth?.token || cookies[COOKIE_NAMES.ACCESS_TOKEN];

    if (!token) {
      console.log("Socket authentication failed: missing token");
      return next(new Error("Authentication required"));
    }

    if (!process.env.ACCESS_TOKEN_SECRET) {
      console.log("Socket authentication failed: access token secret missing");
      return next(new Error("Socket authentication is not configured"));
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken.id);

    if (!user || !user.isActive) {
      console.log("Socket authentication failed: inactive or missing user");
      return next(new Error("Unauthorized socket"));
    }

    socket.user = user;
    socket.join(getUserRoom(user._id));

    if (user.role === USER_ROLES.AGENT) {
      socket.join(getAgentRoom());
    }

    return next();
  } catch (error) {
    console.log(`Socket authentication failed: ${error.message}`);
    return next(new Error("Unauthorized socket"));
  }
};

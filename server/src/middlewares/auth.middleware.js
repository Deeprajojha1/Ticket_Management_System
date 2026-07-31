import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { COOKIE_NAMES } from "../utils/constants.js";

export const authenticateUser = asyncHandler(async (req, _res, next) => {
  const token = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];

  if (!token) {
    throw new ApiError(401, "Authentication required");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (_error) {
    throw new ApiError(401, "Invalid or expired access token");
  }

  const user = await User.findById(decodedToken.id);

  if (!user || !user.isActive) {
    throw new ApiError(401, "User is not authorized");
  }

  req.user = user;
  next();
});

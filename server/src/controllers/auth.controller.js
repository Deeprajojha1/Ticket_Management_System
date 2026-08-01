import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { COOKIE_NAMES } from "../utils/constants.js";
import {
  createSocketToken,
  getUserProfile,
  loginUser,
  logoutUser,
  refreshAuthTokens,
  registerUser,
} from "../services/auth.service.js";

export const register = asyncHandler(async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json(new ApiResponse(201, { user }, "User registered successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const user = await loginUser(req.body, res);

  res.status(200).json(new ApiResponse(200, { user }, "Logged in successfully"));
});

export const logout = asyncHandler(async (req, res) => {
  await logoutUser(req.user._id, res);

  res.status(200).json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const profile = asyncHandler(async (req, res) => {
  const user = getUserProfile(req.user);

  res.status(200).json(new ApiResponse(200, { user }, "Profile fetched successfully"));
});

export const refreshToken = asyncHandler(async (req, res) => {
  const user = await refreshAuthTokens(req.cookies?.[COOKIE_NAMES.REFRESH_TOKEN], res);

  res.status(200).json(new ApiResponse(200, { user }, "Token refreshed successfully"));
});

export const socketToken = asyncHandler(async (req, res) => {
  const token = createSocketToken(req.user);

  res.status(200).json(new ApiResponse(200, { token }, "Socket token created successfully"));
});

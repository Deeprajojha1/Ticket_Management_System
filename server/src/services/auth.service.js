import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import { COOKIE_NAMES, USER_ROLES } from "../utils/constants.js";

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
});

const sanitizeUser = (user) => user.toJSON();

const attachAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, cookieOptions());
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, cookieOptions());
};

const clearAuthCookies = (res) => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, cookieOptions());
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, cookieOptions());
};

const issueTokenPair = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const registerUser = async ({ fullName, email, password, phone }) => {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const user = await User.create({
    fullName,
    email: normalizedEmail,
    password,
    phone,
    role: USER_ROLES.CUSTOMER,
  });

  return sanitizeUser(user);
};

export const loginUser = async ({ email, password }, res) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password +refreshToken");

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid email or password");
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid email or password");
  }

  user.lastLogin = new Date();
  const { accessToken, refreshToken } = await issueTokenPair(user);
  attachAuthCookies(res, accessToken, refreshToken);

  return sanitizeUser(user);
};

export const logoutUser = async (userId, res) => {
  await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  clearAuthCookies(res);
};

export const refreshAuthTokens = async (refreshToken, res) => {
  if (!refreshToken) {
    throw new ApiError(401, "Refresh token is required");
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  } catch (_error) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await User.findById(decodedToken.id).select("+refreshToken");

  if (!user || !user.isActive || user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Refresh token is invalid");
  }

  const tokenPair = await issueTokenPair(user);
  attachAuthCookies(res, tokenPair.accessToken, tokenPair.refreshToken);

  return sanitizeUser(user);
};

export const getUserProfile = (user) => sanitizeUser(user);

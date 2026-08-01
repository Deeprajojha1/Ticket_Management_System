import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import {
  COOKIE_NAMES,
  DEFAULT_ACCESS_TOKEN_EXPIRY,
  DEFAULT_REFRESH_TOKEN_EXPIRY,
  USER_ROLES,
} from "../utils/constants.js";

const expiryToMilliseconds = (value = "") => {
  const match = String(value).trim().match(/^(\d+)\s*([smhd])$/i);
  if (!match) return undefined;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
};

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === "true"
    : process.env.NODE_ENV === "production",
  sameSite: process.env.COOKIE_SAME_SITE || (process.env.NODE_ENV === "production" ? "none" : "lax"),
  path: "/",
});

const cookieOptions = (maxAge) => ({
  ...baseCookieOptions(),
  ...(maxAge ? { maxAge } : {}),
});

const sanitizeUser = (user) => user.toJSON();

const attachAuthCookies = (res, accessToken, refreshToken) => {
  const accessMaxAge = expiryToMilliseconds(process.env.ACCESS_TOKEN_EXPIRY || DEFAULT_ACCESS_TOKEN_EXPIRY);
  const refreshMaxAge = expiryToMilliseconds(process.env.REFRESH_TOKEN_EXPIRY || DEFAULT_REFRESH_TOKEN_EXPIRY);

  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, cookieOptions(accessMaxAge));
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, cookieOptions(refreshMaxAge));
};

const clearAuthCookies = (res) => {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, baseCookieOptions());
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, baseCookieOptions());
};

const issueTokenPair = async (user) => {
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const registerUser = async ({ fullName, email, password, phone, role = USER_ROLES.CUSTOMER }) => {
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
    role,
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

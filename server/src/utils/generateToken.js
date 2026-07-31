import jwt from "jsonwebtoken";
import ApiError from "./ApiError.js";
import {
  DEFAULT_ACCESS_TOKEN_EXPIRY,
  DEFAULT_REFRESH_TOKEN_EXPIRY,
} from "./constants.js";

const signToken = ({ payload, secret, expiresIn, tokenName }) => {
  if (!secret) {
    throw new ApiError(500, `${tokenName} secret is not configured`);
  }

  return jwt.sign(payload, secret, { expiresIn });
};

export const generateAccessToken = (payload) =>
  signToken({
    payload,
    secret: process.env.ACCESS_TOKEN_SECRET,
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY || DEFAULT_ACCESS_TOKEN_EXPIRY,
    tokenName: "Access token",
  });

export const generateRefreshToken = (payload) =>
  signToken({
    payload,
    secret: process.env.REFRESH_TOKEN_SECRET,
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY || DEFAULT_REFRESH_TOKEN_EXPIRY,
    tokenName: "Refresh token",
  });


import ApiError from "../utils/ApiError.js";
import { getRedisClient } from "../config/redis.js";

export const redisRateLimit = ({
  keyPrefix,
  windowSeconds = 60,
  maxRequests = 60,
}) => async (req, res, next) => {
  const redis = getRedisClient();

  if (!redis || redis.status !== "ready") {
    return next();
  }

  const identifier = req.user?._id?.toString() || req.ip;
  const key = `rate-limit:${keyPrefix}:${identifier}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  const ttl = await redis.ttl(key);
  res.setHeader("X-RateLimit-Limit", maxRequests);
  res.setHeader("X-RateLimit-Remaining", Math.max(maxRequests - count, 0));
  res.setHeader("X-RateLimit-Reset", Math.max(ttl, 0));

  if (count > maxRequests) {
    return next(new ApiError(429, "Too many requests. Please try again later."));
  }

  return next();
};

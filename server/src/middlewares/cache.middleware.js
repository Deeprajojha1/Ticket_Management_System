import { getRedisClient } from "../config/redis.js";

export const cacheResponse = (keyBuilder, ttlSeconds = 60) => async (req, res, next) => {
  const redis = getRedisClient();

  if (!redis || redis.status !== "ready") {
    return next();
  }

  const key = keyBuilder(req);
  const cached = await redis.get(key);

  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      redis.set(key, JSON.stringify(body), "EX", ttlSeconds).catch(() => {});
    }

    return originalJson(body);
  };

  return next();
};

export const deleteCachePattern = async (pattern) => {
  const redis = getRedisClient();

  if (!redis || redis.status !== "ready") {
    return;
  }

  const keys = await redis.keys(pattern);
  if (keys.length) {
    await redis.del(keys);
  }
};

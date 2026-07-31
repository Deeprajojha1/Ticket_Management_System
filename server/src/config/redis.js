import Redis from "ioredis";

let redisClient = null;
const DEFAULT_REDIS_URL = "redis://localhost:6379";

export const getRedisClient = () => {
  const redisUrl = process.env.REDIS_URL || DEFAULT_REDIS_URL;

  if (!redisClient) {
    redisClient = new Redis(redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
    });

    redisClient.on("error", (error) => {
      console.error(`Redis error: ${error.message}`);
    });
  }

  return redisClient;
};

export const connectRedis = async () => {
  const client = getRedisClient();

  if (!client) {
    return null;
  }

  try {
    if (client.status === "wait" || client.status === "end") {
      await client.connect();
    }

    console.log("Redis connected");
    return client;
  } catch (error) {
    console.error(`Redis unavailable: ${error.message}`);
    return null;
  }
};

export const closeRedis = async () => {
  if (redisClient) {
    await redisClient.quit();
  }
};

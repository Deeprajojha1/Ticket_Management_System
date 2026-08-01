export const redisRateLimit = ({
  keyPrefix,
  windowSeconds = 60,
  maxRequests = 60,
}) => (req, res, next) => next();

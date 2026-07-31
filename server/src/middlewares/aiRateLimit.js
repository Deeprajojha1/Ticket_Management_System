import rateLimit from "express-rate-limit";

const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
  message: {
    success: false,
    message: "Too many AI requests. Please try again later.",
    errors: [],
  },
});

export default aiRateLimit;

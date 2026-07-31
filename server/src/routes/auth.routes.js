import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  login,
  logout,
  profile,
  refreshToken,
  register,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";

const router = Router();

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later.",
    errors: [],
  },
});

router.post("/register", authRateLimiter, registerValidator, validate, register);
router.post("/login", authRateLimiter, loginValidator, validate, login);
router.post("/logout", authenticateUser, logout);
router.get("/profile", authenticateUser, profile);
router.post("/refresh-token", authRateLimiter, refreshToken);

export default router;

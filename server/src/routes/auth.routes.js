import { Router } from "express";
import {
  login,
  logout,
  profile,
  refreshToken,
  register,
  socketToken,
} from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";

const router = Router();

const authRateLimiter = (req, res, next) => next();

router.post("/register", authRateLimiter, registerValidator, validate, register);
router.post("/login", authRateLimiter, loginValidator, validate, login);
router.post("/logout", authenticateUser, logout);
router.get("/profile", authenticateUser, profile);
router.get("/socket-token", authenticateUser, socketToken);
router.post("/refresh-token", authRateLimiter, refreshToken);

export default router;

import { Router } from "express";
import {
  getMyNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController,
} from "../controllers/notification.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  notificationIdValidator,
  notificationQueryValidator,
} from "../validators/notification.validator.js";

const router = Router();

/**
 * @openapi
 * /api/v1/notifications:
 *   get:
 *     summary: Get current user's notifications
 *     tags: [Notifications]
 */
router.get("/", authenticateUser, notificationQueryValidator, validate, getMyNotificationsController);

/**
 * @openapi
 * /api/v1/notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 */
router.patch("/read-all", authenticateUser, markAllNotificationsReadController);

/**
 * @openapi
 * /api/v1/notifications/{id}/read:
 *   patch:
 *     summary: Mark one notification as read
 *     tags: [Notifications]
 */
router.patch("/:id/read", authenticateUser, notificationIdValidator, validate, markNotificationReadController);

export default router;

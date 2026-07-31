import {
  getMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "../services/notification.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getMyNotificationsController = asyncHandler(async (req, res) => {
  const result = await getMyNotifications({ user: req.user, queryString: req.query });

  res.status(200).json(new ApiResponse(200, result, "Notifications fetched successfully"));
});

export const markNotificationReadController = asyncHandler(async (req, res) => {
  const notification = await markNotificationRead({ notificationId: req.params.id, user: req.user });

  res.status(200).json(new ApiResponse(200, { notification }, "Notification marked as read"));
});

export const markAllNotificationsReadController = asyncHandler(async (req, res) => {
  await markAllNotificationsRead(req.user);

  res.status(200).json(new ApiResponse(200, {}, "All notifications marked as read"));
});

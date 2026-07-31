import Notification from "../models/Notification.model.js";
import APIFeatures from "../utils/APIFeatures.js";
import { getIO } from "../socket/socket.js";
import { getUserRoom } from "../socket/socketRooms.js";

export const createNotification = async ({
  recipient,
  actor = null,
  ticket = null,
  type,
  title,
  message,
  metadata = {},
}) => {
  if (!recipient) {
    return null;
  }

  const notification = await Notification.create({
    recipient,
    actor,
    ticket,
    type,
    title,
    message,
    metadata,
  });

  const populatedNotification = await Notification.findById(notification._id)
    .populate("actor", "fullName email role avatar")
    .populate("ticket", "ticketNumber title status priority")
    .lean();

  getIO()?.to(getUserRoom(recipient)).emit("notification-created", {
    notification: populatedNotification,
  });

  return populatedNotification;
};

export const createNotifications = async (notifications) => {
  const uniqueNotifications = notifications.filter((notification, index, list) => {
    if (!notification.recipient) {
      return false;
    }

    return list.findIndex((item) => item.recipient?.toString() === notification.recipient?.toString()) === index;
  });

  return Promise.all(uniqueNotifications.map((notification) => createNotification(notification)));
};

export const getMyNotifications = async ({ user, queryString }) => {
  const baseQuery = Notification.find({ recipient: user._id })
    .populate("actor", "fullName email role avatar")
    .populate("ticket", "ticketNumber title status priority");

  const features = new APIFeatures(baseQuery, queryString)
    .filter(["isRead", "type"])
    .sort();

  const totalDocuments = await Notification.countDocuments(features.query.getFilter());
  features.paginate(totalDocuments);
  const notifications = await features.query.lean();

  return { notifications, pagination: features.pagination };
};

export const markNotificationRead = async ({ notificationId, user }) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: user._id },
    { isRead: true, readAt: new Date() },
    { new: true },
  );

  return notification;
};

export const markAllNotificationsRead = async (user) => {
  await Notification.updateMany(
    { recipient: user._id, isRead: false },
    { isRead: true, readAt: new Date() },
  );
};

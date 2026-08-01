import { useState } from "react";
import { Bell } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown.jsx";
import { dashboardApi, useMarkAllNotificationsReadMutation, useNotificationsQuery } from "../agent/services/dashboardApi.js";
import { useDispatch } from "react-redux";

const NotificationBell = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const { data } = useNotificationsQuery({ page: 1, limit: 8 }, { pollingInterval: 30000 });
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const notifications = data?.data?.notifications || [];
  const unreadNotifications = notifications.filter((item) => !item.isRead);
  const unreadCount = unreadNotifications.length;

  const markVisibleNotificationsRead = async () => {
    if (!unreadCount) return;

    dispatch(
      dashboardApi.util.updateQueryData("notifications", { page: 1, limit: 8 }, (draft) => {
        if (!draft?.data?.notifications) return;

        const readAt = new Date().toISOString();
        draft.data.notifications = draft.data.notifications
          .filter((notification) => notification.isRead)
          .map((notification) => ({
            ...notification,
            isRead: true,
            readAt: notification.readAt || readAt,
          }));
      }),
    );

    try {
      await markAllRead().unwrap();
    } catch (_error) {
      dispatch(dashboardApi.util.invalidateTags(["Notifications"]));
    }
  };

  const handleToggle = () => {
    setOpen((value) => {
      const nextOpen = !value;
      if (nextOpen) {
        markVisibleNotificationsRead();
      }
      return nextOpen;
    });
  };

  return (
    <div className="relative">
      <button
        className="focus-ring relative rounded-lg p-2.5 text-slate-600 hover:bg-slate-100"
        onClick={handleToggle}
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>
      {open ? <NotificationDropdown notifications={unreadNotifications} onMarkAllRead={markVisibleNotificationsRead} /> : null}
    </div>
  );
};

export default NotificationBell;

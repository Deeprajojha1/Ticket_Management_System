import { useState } from "react";
import { Bell } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown.jsx";
import { useMarkAllNotificationsReadMutation, useNotificationsQuery } from "../agent/services/dashboardApi.js";

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const { data } = useNotificationsQuery({ page: 1, limit: 8 });
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const notifications = data?.data?.notifications || [];
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="relative">
      <button
        className="focus-ring relative rounded-lg p-2.5 text-slate-600 hover:bg-slate-100"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount ? (
          <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>
      {open ? <NotificationDropdown notifications={notifications} onMarkAllRead={() => markAllRead()} /> : null}
    </div>
  );
};

export default NotificationBell;

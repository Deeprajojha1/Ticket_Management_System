import { formatDate } from "../tickets/utils.js";

const NotificationItem = ({ notification }) => (
  <article className={`rounded-lg border p-3 ${notification.isRead ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"}`}>
    <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
    <p className="mt-1 text-sm leading-5 text-slate-600">{notification.message}</p>
    <p className="mt-2 text-xs text-slate-500">{formatDate(notification.createdAt, { withTime: true })}</p>
  </article>
);

export default NotificationItem;

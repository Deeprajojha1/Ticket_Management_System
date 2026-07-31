import Button from "../../components/common/Button/Button.jsx";
import NotificationItem from "./NotificationItem.jsx";

const NotificationDropdown = ({ notifications = [], onMarkAllRead }) => (
  <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
      <h3 className="text-sm font-semibold text-slate-950">Notifications</h3>
      <Button variant="ghost" className="min-h-8 px-2 py-1 text-xs" onClick={onMarkAllRead}>Mark all read</Button>
    </div>
    <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">
      {notifications.length ? notifications.map((item) => <NotificationItem key={item._id} notification={item} />) : (
        <p className="py-8 text-center text-sm text-slate-500">No notifications yet.</p>
      )}
    </div>
  </div>
);

export default NotificationDropdown;

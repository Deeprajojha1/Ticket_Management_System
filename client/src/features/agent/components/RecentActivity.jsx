import { Activity } from "lucide-react";
import Card from "../../../components/common/Card/Card.jsx";
import { formatDate } from "../../tickets/utils.js";

const RecentActivity = ({ activities = [] }) => (
  <Card className="p-5">
    <div className="flex items-center justify-between">
      <h3 className="text-base font-semibold text-slate-950">Recent Activity</h3>
      <Activity className="h-5 w-5 text-blue-600" />
    </div>
    <div className="mt-5 max-h-96 space-y-4 overflow-y-auto pr-1">
      {activities.length ? activities.map((activity, index) => (
        <div key={`${activity.ticket?._id}-${activity.createdAt}-${index}`} className="flex gap-3">
          <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">{activity.action}</p>
            <p className="mt-1 truncate text-sm text-slate-600">{activity.ticket?.ticketNumber} - {activity.ticket?.title}</p>
            <p className="mt-1 text-xs text-slate-500">
              {formatDate(activity.createdAt, { withTime: true })} {activity.actor?.fullName ? `by ${activity.actor.fullName}` : ""}
            </p>
          </div>
        </div>
      )) : <p className="text-sm text-slate-500">No recent activity.</p>}
    </div>
  </Card>
);

export default RecentActivity;

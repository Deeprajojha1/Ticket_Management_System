import { CheckCircle2 } from "lucide-react";
import Card from "../../../components/common/Card/Card.jsx";
import { formatDate } from "../utils.js";

const TicketTimeline = ({ activities = [] }) => (
  <Card className="p-5">
    <h2 className="text-base font-semibold text-slate-950">Timeline</h2>
    {activities.length ? (
      <ol className="mt-5 space-y-5">
        {activities.map((activity, index) => (
          <li key={`${activity.action}-${activity.createdAt}-${index}`} className="relative flex gap-3">
            {index < activities.length - 1 ? <span className="absolute left-4 top-9 h-full w-px bg-slate-200" /> : null}
            <span className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{activity.action}</p>
              <p className="mt-1 text-xs text-slate-500">
                {formatDate(activity.createdAt, { withTime: true })}
                {activity.actor?.fullName ? ` by ${activity.actor.fullName}` : ""}
              </p>
              {activity.from || activity.to ? (
                <p className="mt-1 text-xs text-slate-600">{activity.from || "-"} to {activity.to || "-"}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    ) : (
      <p className="mt-4 text-sm text-slate-500">No activity yet.</p>
    )}
  </Card>
);

export default TicketTimeline;

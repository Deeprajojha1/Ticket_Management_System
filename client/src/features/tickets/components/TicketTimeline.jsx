import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import Card from "../../../components/common/Card/Card.jsx";
import { formatDate } from "../utils.js";

const INITIAL_VISIBLE_ACTIVITIES = 4;

const TicketTimeline = ({ activities = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const canToggle = activities.length > INITIAL_VISIBLE_ACTIVITIES;
  const visibleActivities = isExpanded ? activities : activities.slice(0, INITIAL_VISIBLE_ACTIVITIES);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-950">Timeline</h2>
        {canToggle ? (
          <button
            type="button"
            className="focus-ring inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-50"
            onClick={() => setIsExpanded((value) => !value)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {isExpanded ? "Show less" : "Show more"}
          </button>
        ) : null}
      </div>
      {activities.length ? (
        <ol className="mt-5 space-y-5">
          {visibleActivities.map((activity, index) => (
            <li key={`${activity.action}-${activity.createdAt}-${index}`} className="relative flex gap-3">
              {index < visibleActivities.length - 1 ? <span className="absolute left-4 top-9 h-full w-px bg-slate-200" /> : null}
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
};

export default TicketTimeline;

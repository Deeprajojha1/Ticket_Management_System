import { Link } from "../../../lib/router.jsx";
import { ArrowUpRight, MessageSquare } from "lucide-react";
import Card from "../../../components/common/Card/Card.jsx";
import { formatDate, getTicketId } from "../utils.js";
import PriorityBadge from "./PriorityBadge.jsx";
import TicketStatusBadge from "./TicketStatusBadge.jsx";

const TicketCard = ({ onOpenChat, ticket }) => (
  <Card className="p-4 transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
    <div className="flex items-start justify-between gap-3">
      <p className="rounded bg-slate-100 px-1.5 py-1 text-xs font-semibold text-slate-600">{ticket.ticketNumber}</p>
      <div className="flex shrink-0 gap-2">
        <Link
          aria-label="View ticket details"
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          to={`/customer/tickets/${getTicketId(ticket)}?view=details`}
        >
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          aria-label="Open ticket chat"
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
          onClick={() => onOpenChat?.(ticket)}
        >
          <MessageSquare className="h-4 w-4" />
        </button>
      </div>
    </div>
    <div className="mt-4 min-w-0">
      <h3 className="truncate text-base font-semibold text-slate-950">{ticket.title}</h3>
    </div>
    <div className="mt-3 flex flex-wrap gap-2">
      <TicketStatusBadge status={ticket.status} />
      <PriorityBadge priority={ticket.priority} />
      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{ticket.category}</span>
    </div>
    <div className="mt-5 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
      <div className="grid grid-cols-[6.5rem_1fr] gap-2">
        <span className="text-slate-500">Assigned to</span>
        <span className="font-semibold text-slate-900">{ticket.assignedAgent?.fullName || "Unassigned"}</span>
      </div>
      <div className="grid grid-cols-[6.5rem_1fr] gap-2">
        <span className="text-slate-500">Created</span>
        <span className="font-semibold text-slate-900">{formatDate(ticket.createdAt)}</span>
      </div>
      <div className="grid grid-cols-[6.5rem_1fr] gap-2">
        <span className="text-slate-500">Last activity</span>
        <span className="font-semibold text-slate-900">{formatDate(ticket.lastActivity, { withTime: true })}</span>
      </div>
    </div>
  </Card>
);

export default TicketCard;

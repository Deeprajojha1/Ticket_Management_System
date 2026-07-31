import { Link } from "../../../lib/router.jsx";
import { ArrowUpRight } from "lucide-react";
import Card from "../../../components/common/Card/Card.jsx";
import { formatDate, getTicketId } from "../utils.js";
import PriorityBadge from "./PriorityBadge.jsx";
import TicketStatusBadge from "./TicketStatusBadge.jsx";

const TicketCard = ({ ticket }) => (
  <Card className="p-4 transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-slate-500">{ticket.ticketNumber}</p>
        <h3 className="mt-1 truncate text-base font-semibold text-slate-950">{ticket.title}</h3>
      </div>
      <Link className="focus-ring rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-700" to={`/customer/tickets/${getTicketId(ticket)}`}>
        <ArrowUpRight className="h-4 w-4" />
      </Link>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <TicketStatusBadge status={ticket.status} />
      <PriorityBadge priority={ticket.priority} />
      <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{ticket.category}</span>
    </div>
    <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-2">
      <span>Created {formatDate(ticket.createdAt)}</span>
      <span>Last activity {formatDate(ticket.lastActivity, { withTime: true })}</span>
    </div>
  </Card>
);

export default TicketCard;

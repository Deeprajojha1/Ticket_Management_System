import { Link } from "../../../lib/router.jsx";
import { Eye } from "lucide-react";
import { formatDate, getTicketId } from "../utils.js";
import PriorityBadge from "./PriorityBadge.jsx";
import TicketCard from "./TicketCard.jsx";
import TicketStatusBadge from "./TicketStatusBadge.jsx";

const TicketTable = ({ tickets = [] }) => (
  <>
    <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white lg:block">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            {["Ticket Number", "Title", "Category", "Priority", "Status", "Assigned Agent", "Created Date", "Last Activity", "Actions"].map((head) => (
              <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {tickets.map((ticket) => (
            <tr key={getTicketId(ticket)} className="hover:bg-slate-50">
              <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">{ticket.ticketNumber}</td>
              <td className="max-w-xs truncate px-4 py-4 text-sm text-slate-700">{ticket.title}</td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{ticket.category}</td>
              <td className="whitespace-nowrap px-4 py-4"><PriorityBadge priority={ticket.priority} /></td>
              <td className="whitespace-nowrap px-4 py-4"><TicketStatusBadge status={ticket.status} /></td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{ticket.assignedAgent?.fullName || "Unassigned"}</td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{formatDate(ticket.createdAt)}</td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{formatDate(ticket.lastActivity, { withTime: true })}</td>
              <td className="whitespace-nowrap px-4 py-4">
                <Link className="focus-ring inline-flex rounded-md p-2 text-slate-500 hover:bg-blue-50 hover:text-blue-700" to={`/customer/tickets/${getTicketId(ticket)}`} aria-label={`View ${ticket.ticketNumber}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="grid gap-3 lg:hidden">
      {tickets.map((ticket) => <TicketCard key={getTicketId(ticket)} ticket={ticket} />)}
    </div>
  </>
);

export default TicketTable;

import { Link } from "../../../lib/router.jsx";
import { Eye, MessageSquare } from "lucide-react";
import { formatDate, getTicketId } from "../utils.js";
import PriorityBadge from "./PriorityBadge.jsx";
import TicketCard from "./TicketCard.jsx";
import TicketStatusBadge from "./TicketStatusBadge.jsx";

const TicketTable = ({ onOpenChat, tickets = [] }) => (
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
                <div className="flex items-center gap-2">
                  <Link className="focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700" to={`/customer/tickets/${getTicketId(ticket)}?view=details`} aria-label={`View details for ${ticket.ticketNumber}`}>
                    <Eye className="h-4 w-4" />
                    Details
                  </Link>
                  <button type="button" className="focus-ring inline-flex min-h-9 items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700" onClick={() => onOpenChat?.(ticket)} aria-label={`Open chat for ${ticket.ticketNumber}`}>
                    <MessageSquare className="h-4 w-4" />
                    Chat
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    <div className="grid gap-3 lg:hidden">
      {tickets.map((ticket) => <TicketCard key={getTicketId(ticket)} ticket={ticket} onOpenChat={onOpenChat} />)}
    </div>
  </>
);

export default TicketTable;

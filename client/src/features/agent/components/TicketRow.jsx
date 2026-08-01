import { ExternalLink, UserPlus } from "lucide-react";
import Button from "../../../components/common/Button/Button.jsx";
import PriorityBadge from "../../tickets/components/PriorityBadge.jsx";
import TicketStatusBadge from "../../tickets/components/TicketStatusBadge.jsx";
import { formatDate } from "../../tickets/utils.js";
import PriorityDropdown from "./PriorityDropdown.jsx";
import StatusDropdown from "./StatusDropdown.jsx";

const TicketRow = ({ ticket, onAssign, onOpen }) => (
  <tr className="hover:bg-slate-50">
    <td className="truncate px-3 py-4 text-sm font-semibold text-slate-900">{ticket.ticketNumber}</td>
    <td className="min-w-0 px-3 py-4">
      <p className="truncate text-sm font-semibold text-slate-900">{ticket.createdBy?.fullName || "Customer"}</p>
      <p className="truncate text-xs text-slate-500">{ticket.createdBy?.email}</p>
    </td>
    <td className="truncate px-3 py-4 text-sm text-slate-700">{ticket.title}</td>
    <td className="truncate px-3 py-4 text-sm text-slate-600">{ticket.category}</td>
    <td className="px-3 py-4"><PriorityBadge priority={ticket.priority} /></td>
    <td className="px-3 py-4"><TicketStatusBadge status={ticket.status} /></td>
    <td className="truncate px-3 py-4 text-sm text-slate-600">{ticket.assignedAgent?.fullName || "Unassigned"}</td>
    <td className="truncate px-3 py-4 text-sm text-slate-600">{formatDate(ticket.createdAt)}</td>
    <td className="truncate px-3 py-4 text-sm text-slate-600">{formatDate(ticket.lastActivity, { withTime: true })}</td>
    <td className="px-3 py-4">
      <div className="flex items-center justify-end gap-2">
        {!ticket.assignedAgent?._id ? (
          <Button variant="secondary" className="min-h-9 px-2 py-1.5 text-xs" onClick={() => onAssign(ticket)} title="Assign">
            <UserPlus className="h-3.5 w-3.5" />
            <span className="sr-only">Assign</span>
          </Button>
        ) : null}
        <button className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => onOpen(ticket)} title="Open">
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="sr-only">Open</span>
        </button>
      </div>
    </td>
  </tr>
);

export const AgentTicketCard = ({ ticket, onAssign, onOpen }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase text-slate-500">{ticket.ticketNumber}</p>
        <h3 className="mt-1 truncate text-base font-semibold text-slate-950">{ticket.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{ticket.createdBy?.fullName || "Customer"}</p>
      </div>
      <TicketStatusBadge status={ticket.status} />
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <PriorityBadge priority={ticket.priority} />
      <span className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">{ticket.category}</span>
    </div>
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <StatusDropdown ticket={ticket} />
      <PriorityDropdown ticket={ticket} />
    </div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-slate-500">Assigned: {ticket.assignedAgent?.fullName || "Unassigned"}</p>
      <div className="flex gap-2">
        {!ticket.assignedAgent?._id ? (
          <Button variant="secondary" onClick={() => onAssign(ticket)}>
            <UserPlus className="h-4 w-4" />
            Assign
          </Button>
        ) : null}
        <button className="focus-ring inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700" onClick={() => onOpen(ticket)}>
          <ExternalLink className="h-4 w-4" />
          Open
        </button>
      </div>
    </div>
  </div>
);

export default TicketRow;

import Card from "../../../components/common/Card/Card.jsx";
import { formatDate } from "../utils.js";
import AttachmentPreview from "./AttachmentPreview.jsx";
import PriorityBadge from "./PriorityBadge.jsx";
import TicketStatusBadge from "./TicketStatusBadge.jsx";

const TicketDetailsCard = ({ ticket }) => (
  <Card className="p-5 sm:p-6">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <p className="text-sm font-semibold text-blue-700">{ticket.ticketNumber}</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-950">{ticket.title}</h1>
      </div>
      <div className="flex flex-wrap gap-2">
        <TicketStatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
      </div>
    </div>

    <dl className="mt-6 grid gap-4 border-y border-slate-200 py-5 sm:grid-cols-2 lg:grid-cols-4">
      {[
        ["Category", ticket.category],
        ["Created", formatDate(ticket.createdAt, { withTime: true })],
        ["Last Activity", formatDate(ticket.lastActivity, { withTime: true })],
        ["Assigned Agent", ticket.assignedAgent?.fullName || "Unassigned"],
      ].map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-semibold uppercase text-slate-500">{label}</dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
        </div>
      ))}
    </dl>

    <div className="mt-5">
      <h2 className="text-sm font-semibold text-slate-950">Description</h2>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{ticket.description}</p>
    </div>

    <div className="mt-6">
      <h2 className="text-sm font-semibold text-slate-950">Attachments</h2>
      {ticket.attachments?.length ? (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {ticket.attachments.map((attachment) => (
            <AttachmentPreview key={attachment.public_id || attachment.url} attachment={attachment} />
          ))}
        </div>
      ) : (
        <p className="mt-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
          No attachments added.
        </p>
      )}
    </div>
  </Card>
);

export default TicketDetailsCard;

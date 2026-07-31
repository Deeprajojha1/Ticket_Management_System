import TicketRow, { AgentTicketCard } from "./TicketRow.jsx";

const TicketTable = ({ tickets = [], onAssign, onOpen }) => (
  <>
    <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white 2xl:block">
      <table className="min-w-[1180px] divide-y divide-slate-200">
        <thead className="sticky top-16 bg-slate-50">
          <tr>
            {["Ticket", "Customer", "Title", "Category", "Priority", "Status", "Assigned Agent", "Created", "Last Activity", "Actions"].map((head) => (
              <th key={head} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{head}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {tickets.map((ticket) => <TicketRow key={ticket._id} ticket={ticket} onAssign={onAssign} onOpen={onOpen} />)}
        </tbody>
      </table>
    </div>
    <div className="grid gap-3 2xl:hidden">
      {tickets.map((ticket) => <AgentTicketCard key={ticket._id} ticket={ticket} onAssign={onAssign} onOpen={onOpen} />)}
    </div>
  </>
);

export default TicketTable;

const styles = {
  Open: "border-blue-200 bg-blue-50 text-blue-700",
  "In Progress": "border-orange-200 bg-orange-50 text-orange-700",
  Resolved: "border-green-200 bg-green-50 text-green-700",
  Closed: "border-slate-200 bg-slate-100 text-slate-700",
};

const TicketStatusBadge = ({ status = "Open" }) => (
  <span className={`inline-flex min-w-max items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] || styles.Open}`}>
    {status}
  </span>
);

export default TicketStatusBadge;

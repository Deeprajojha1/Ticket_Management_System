const styles = {
  Low: "border-slate-200 bg-slate-100 text-slate-700",
  Medium: "border-blue-200 bg-blue-50 text-blue-700",
  High: "border-orange-200 bg-orange-50 text-orange-700",
  Urgent: "border-red-200 bg-red-50 text-red-700",
};

const PriorityBadge = ({ priority = "Medium" }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[priority] || styles.Medium}`}>
    {priority}
  </span>
);

export default PriorityBadge;

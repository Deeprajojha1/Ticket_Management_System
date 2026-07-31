export const AGENT_SORT_OPTIONS = [
  { label: "Last Activity", value: "lastActivity" },
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Priority", value: "priority" },
  { label: "Status", value: "status" },
];

export const CHART_COLORS = ["#2563eb", "#ea580c", "#16a34a", "#64748b", "#dc2626", "#0891b2"];

export const DEFAULT_AGENT_FILTERS = {
  page: 1,
  limit: 10,
  search: "",
  status: "",
  priority: "",
  category: "",
  startDate: "",
  endDate: "",
  sort: "lastActivity",
};

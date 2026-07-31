import { formatDate } from "../tickets/utils.js";

export const exportTicketsCsv = (tickets = []) => {
  const headers = [
    "Ticket Number",
    "Customer",
    "Email",
    "Title",
    "Category",
    "Priority",
    "Status",
    "Assigned Agent",
    "Created",
    "Last Activity",
  ];
  const rows = tickets.map((ticket) => [
    ticket.ticketNumber,
    ticket.createdBy?.fullName || "",
    ticket.createdBy?.email || "",
    ticket.title,
    ticket.category,
    ticket.priority,
    ticket.status,
    ticket.assignedAgent?.fullName || "Unassigned",
    formatDate(ticket.createdAt),
    formatDate(ticket.lastActivity, { withTime: true }),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "supportdesk-agent-tickets.csv";
  link.click();
  URL.revokeObjectURL(url);
};

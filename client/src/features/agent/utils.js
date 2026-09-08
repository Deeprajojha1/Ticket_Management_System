import { formatDate } from "../tickets/utils.js";

const formatCsvDate = (value, options) => {
  const formattedDate = formatDate(value, options);
  return formattedDate === "-" ? "" : `\t${formattedDate}`;
};

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
    formatCsvDate(ticket.createdAt),
    formatCsvDate(ticket.lastActivity, { withTime: true }),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "supportdesk-agent-tickets.csv";
  link.click();
  URL.revokeObjectURL(url);
};

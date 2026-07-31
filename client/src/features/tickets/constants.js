export const TICKET_CATEGORIES = ["Technical", "Billing", "Refund", "Account", "General", "Other"];
export const TICKET_PRIORITIES = ["Low", "Medium", "High", "Urgent"];
export const TICKET_STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

export const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Priority", value: "priority" },
  { label: "Status", value: "status" },
];

export const MAX_ATTACHMENTS = 5;
export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_ATTACHMENT_TYPES = ["image/png", "image/jpg", "image/jpeg", "application/pdf"];

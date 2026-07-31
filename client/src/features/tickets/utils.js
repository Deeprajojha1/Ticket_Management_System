export const formatDate = (value, options = {}) => {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: options.withTime ? "short" : undefined,
  }).format(new Date(value));
};

export const formatFileSize = (bytes = 0) => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

export const getApiErrorMessage = (error, fallback = "Something went wrong") =>
  error?.data?.message || error?.data?.errors?.[0]?.msg || fallback;

export const getTicketId = (ticket) => ticket?._id || ticket?.id;

export const getInitials = (name = "User") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

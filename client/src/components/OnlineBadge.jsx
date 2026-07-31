import { useOnlineUsers } from "../hooks/useOnlineUsers.js";

const OnlineBadge = ({ userId }) => {
  const onlineUsers = useOnlineUsers();
  const state = onlineUsers[userId];
  const isOnline = state?.online;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${isOnline ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>
      <span className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-slate-400"}`} />
      {isOnline ? "Online" : "Offline"}
    </span>
  );
};

export default OnlineBadge;

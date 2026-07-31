import { useAuth } from "../../../hooks/useAuth.js";

const UserAvatar = () => {
  const { user } = useAuth();
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
      {(user?.fullName || "U").slice(0, 1).toUpperCase()}
    </div>
  );
};

export default UserAvatar;

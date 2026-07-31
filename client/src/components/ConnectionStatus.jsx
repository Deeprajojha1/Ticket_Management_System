import { Wifi, WifiOff } from "lucide-react";
import { useSocket } from "../hooks/useSocket.js";

const styles = {
  connected: "border-green-200 bg-green-50 text-green-700",
  connecting: "border-blue-200 bg-blue-50 text-blue-700",
  reconnecting: "border-orange-200 bg-orange-50 text-orange-700",
  disconnected: "border-red-200 bg-red-50 text-red-700",
  offline: "border-slate-200 bg-slate-100 text-slate-700",
};

const ConnectionStatus = () => {
  const { connectionState = "disconnected" } = useSocket() || {};
  const connected = connectionState === "connected";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[connectionState] || styles.disconnected}`}>
      {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      {connectionState}
    </span>
  );
};

export default ConnectionStatus;

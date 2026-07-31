import { Radio } from "lucide-react";

const LiveStatusBadge = ({ label = "Live" }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
    <Radio className="h-3.5 w-3.5" />
    {label}
  </span>
);

export default LiveStatusBadge;

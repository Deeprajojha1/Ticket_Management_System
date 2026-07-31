import { Loader2 } from "lucide-react";

const Loader = ({ label = "Loading" }) => (
  <div className="flex min-h-64 items-center justify-center">
    <div className="flex items-center gap-3 text-sm font-medium text-slate-600">
      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      <span>{label}</span>
    </div>
  </div>
);

export default Loader;

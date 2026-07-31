import { RefreshCw } from "lucide-react";
import Button from "../../../components/common/Button/Button.jsx";
import LiveStatusBadge from "../../../components/LiveStatusBadge.jsx";

const DashboardHeader = ({ eyebrow, title, description, onRefresh, isRefreshing }) => (
  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <p className="text-sm font-semibold text-blue-700">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-bold text-slate-950">{title}</h2>
      {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{description}</p> : null}
    </div>
    <div className="flex items-center gap-2">
      <LiveStatusBadge label="Auto refresh" />
      {onRefresh ? (
        <Button variant="secondary" onClick={onRefresh} isLoading={isRefreshing}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      ) : null}
    </div>
  </div>
);

export default DashboardHeader;

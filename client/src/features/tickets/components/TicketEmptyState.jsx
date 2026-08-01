import { Inbox, PlusCircle } from "lucide-react";
import Button from "../../../components/common/Button/Button.jsx";

const TicketEmptyState = ({ action, compact = false, description = "No records found.", title = "Nothing here yet" }) => (
  <div
    className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-center ${
      compact ? "min-h-28 p-3" : "min-h-64 p-8"
    }`}
  >
    <div className={`flex items-center justify-center rounded-lg bg-blue-50 text-blue-700 ${compact ? "h-9 w-9" : "h-14 w-14"}`}>
      <Inbox className={compact ? "h-4 w-4" : "h-7 w-7"} />
    </div>
    <h2 className={`${compact ? "mt-2 text-sm" : "mt-4 text-lg"} font-semibold text-slate-950`}>{title}</h2>
    <p className={`mt-1 max-w-md text-sm text-slate-600 ${compact ? "leading-5" : "leading-6"}`}>{description}</p>
    {action ? (
      <div className={compact ? "mt-3" : "mt-5"}>
        <Button>
          <PlusCircle className="h-4 w-4" />
          {action}
        </Button>
      </div>
    ) : null}
  </div>
);

export default TicketEmptyState;

import { Inbox, PlusCircle } from "lucide-react";
import Button from "../../../components/common/Button/Button.jsx";

const TicketEmptyState = ({ action, description = "No records found.", title = "Nothing here yet" }) => (
  <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
      <Inbox className="h-7 w-7" />
    </div>
    <h2 className="mt-4 text-lg font-semibold text-slate-950">{title}</h2>
    <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">{description}</p>
    {action ? (
      <div className="mt-5">
        <Button>
          <PlusCircle className="h-4 w-4" />
          {action}
        </Button>
      </div>
    ) : null}
  </div>
);

export default TicketEmptyState;

import Card from "../../../components/common/Card/Card.jsx";
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from "../../tickets/constants.js";
import { AGENT_SORT_OPTIONS } from "../constants.js";
import SearchBar from "./SearchBar.jsx";

const TicketFilters = ({ filters, onChange }) => {
  const update = (key, value) => onChange({ ...filters, [key]: value, page: 1 });

  return (
    <Card className="p-4">
      <div className="grid gap-3 xl:grid-cols-[1.5fr_repeat(6,1fr)]">
        <SearchBar value={filters.search} onChange={(value) => update("search", value)} />
        <select className="focus-ring min-h-12 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-base sm:min-h-11 sm:text-sm" value={filters.status} onChange={(event) => update("status", event.target.value)}>
          <option value="">All Status</option>
          {TICKET_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select className="focus-ring min-h-12 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-base sm:min-h-11 sm:text-sm" value={filters.priority} onChange={(event) => update("priority", event.target.value)}>
          <option value="">All Priority</option>
          {TICKET_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
        </select>
        <select className="focus-ring min-h-12 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-base sm:min-h-11 sm:text-sm" value={filters.category} onChange={(event) => update("category", event.target.value)}>
          <option value="">All Category</option>
          {TICKET_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-500 xl:sr-only">Start date</span>
          <input className="focus-ring min-h-12 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-base sm:min-h-11 sm:text-sm" type="date" value={filters.startDate} onChange={(event) => update("startDate", event.target.value)} />
        </label>
        <label className="grid gap-1">
          <span className="text-xs font-semibold text-slate-500 xl:sr-only">End date</span>
          <input className="focus-ring min-h-12 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-base sm:min-h-11 sm:text-sm" type="date" value={filters.endDate} onChange={(event) => update("endDate", event.target.value)} />
        </label>
        <select className="focus-ring min-h-12 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-base sm:min-h-11 sm:text-sm" value={filters.sort} onChange={(event) => update("sort", event.target.value)}>
          {AGENT_SORT_OPTIONS.map((sort) => <option key={sort.value} value={sort.value}>{sort.label}</option>)}
        </select>
      </div>
    </Card>
  );
};

export default TicketFilters;

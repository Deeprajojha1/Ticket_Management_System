import { useMemo, useState } from "react";
import { Link } from "../../../lib/router.jsx";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Plus, RefreshCw, Search } from "lucide-react";
import Button from "../../../components/common/Button/Button.jsx";
import Card from "../../../components/common/Card/Card.jsx";
import { SORT_OPTIONS, TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from "../constants.js";
import TicketEmptyState from "../components/TicketEmptyState.jsx";
import TicketSkeleton from "../components/TicketSkeleton.jsx";
import TicketTable from "../components/TicketTable.jsx";
import { useGetMyTicketsQuery } from "../services/ticketApi.js";

const MyTickets = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
    status: "",
    priority: "",
    category: "",
    sort: "newest",
  });

  const queryParams = useMemo(
    () => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "")),
    [filters],
  );
  const { data, isFetching, refetch } = useGetMyTicketsQuery(queryParams);
  const tickets = data?.data?.tickets || [];
  const pagination = data?.data?.pagination || {};

  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-blue-700">My Tickets</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Support requests</h1>
        </div>
        <Button as={Link} to="/customer/tickets/create" className="w-44 self-end sm:w-auto sm:self-auto">
          <Plus className="h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      <Card className="p-4">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
          <label className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search ticket number, title, description"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              className="focus-ring min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none"
            />
          </label>
          <select className="focus-ring min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            <option value="">All Status</option>
            {TICKET_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
          <select className="focus-ring min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={filters.priority} onChange={(event) => updateFilter("priority", event.target.value)}>
            <option value="">All Priority</option>
            {TICKET_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
          </select>
          <select className="focus-ring min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={filters.category} onChange={(event) => updateFilter("category", event.target.value)}>
            <option value="">All Category</option>
            {TICKET_CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <select className="focus-ring min-h-11 rounded-lg border border-slate-300 bg-white px-3 text-sm" value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}>
            {SORT_OPTIONS.map((sort) => <option key={sort.value} value={sort.value}>{sort.label}</option>)}
          </select>
        </div>
      </Card>

      {isFetching ? <TicketSkeleton rows={6} /> : null}
      {!isFetching && tickets.length ? <TicketTable tickets={tickets} /> : null}
      {!isFetching && !tickets.length ? (
        <TicketEmptyState title="No tickets found" description="Try adjusting your filters or create a new support request." action={<Link to="/customer/tickets/create">Create Ticket</Link>} />
      ) : null}

      <div className="flex flex-col items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 sm:flex-row">
        <p className="text-sm text-slate-600">
          Page {pagination.currentPage || 1} of {pagination.totalPages || 1}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="secondary" disabled={!pagination.previousPage} onClick={() => setFilters((current) => ({ ...current, page: pagination.previousPage }))}>
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button variant="secondary" disabled={!pagination.nextPage} onClick={() => setFilters((current) => ({ ...current, page: pagination.nextPage }))}>
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={refetch}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MyTickets;

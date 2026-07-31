import { Link } from "../../../lib/router.jsx";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock3, ListChecks, Plus, Ticket } from "lucide-react";
import Button from "../../../components/common/Button/Button.jsx";
import Card from "../../../components/common/Card/Card.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import { useGetMyTicketsQuery } from "../services/ticketApi.js";
import { getTicketId } from "../utils.js";
import TicketCard from "../components/TicketCard.jsx";
import TicketEmptyState from "../components/TicketEmptyState.jsx";
import TicketSkeleton from "../components/TicketSkeleton.jsx";

const CustomerDashboard = () => {
  const { user } = useAuth();
  const { data, isFetching, refetch } = useGetMyTicketsQuery({ page: 1, limit: 100, sort: "newest" });
  const tickets = data?.data?.tickets || [];
  const recentTickets = tickets.slice(0, 5);
  const stats = [
    { label: "Total Tickets", value: tickets.length, icon: Ticket },
    { label: "Open", value: tickets.filter((ticket) => ticket.status === "Open").length, icon: ListChecks },
    { label: "In Progress", value: tickets.filter((ticket) => ticket.status === "In Progress").length, icon: Clock3 },
    { label: "Resolved", value: tickets.filter((ticket) => ticket.status === "Resolved").length, icon: CheckCircle2 },
    { label: "High Priority", value: tickets.filter((ticket) => ["High", "Urgent"].includes(ticket.priority)).length, icon: AlertTriangle },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-blue-700">Customer Dashboard</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-950">Welcome, {user?.fullName || "there"}</h1>
          <p className="mt-2 text-sm text-slate-600">Track your support work and keep every conversation in one place.</p>
        </div>
        <Button as={Link} to="/customer/tickets/create">
          <Plus className="h-4 w-4" />
          Create Ticket
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ icon: Icon, label, value }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <p className="mt-4 text-3xl font-bold text-slate-950">{value}</p>
          </Card>
        ))}
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">Recent Tickets</h2>
          <Link to="/customer/tickets" className="text-sm font-semibold text-blue-700 hover:text-blue-800">View all</Link>
        </div>
        {isFetching ? <TicketSkeleton rows={3} /> : null}
        {!isFetching && recentTickets.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {recentTickets.map((ticket) => <TicketCard key={getTicketId(ticket)} ticket={ticket} />)}
          </div>
        ) : null}
        {!isFetching && !recentTickets.length ? (
          <TicketEmptyState
            title="No tickets yet"
            description="Create your first support ticket and the team will track it from here."
            action={<Link to="/customer/tickets/create">Create Ticket</Link>}
          />
        ) : null}
        {!isFetching && data?.success === false ? (
          <Button variant="secondary" onClick={refetch}>Retry</Button>
        ) : null}
      </section>
    </motion.div>
  );
};

export default CustomerDashboard;

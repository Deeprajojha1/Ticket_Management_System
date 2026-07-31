import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock3, Flame, Inbox, ListChecks, Ticket, Timer, UserCheck } from "lucide-react";
import Card from "../../../components/common/Card/Card.jsx";
import AnalyticsChart from "../components/AnalyticsChart.jsx";
import DashboardCards from "../components/DashboardCards.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import DashboardSkeleton from "../components/DashboardSkeleton.jsx";
import RecentActivity from "../components/RecentActivity.jsx";
import {
  useCategoryChartQuery,
  useOverviewQuery,
  usePriorityChartQuery,
  useRecentActivityQuery,
  useStatusChartQuery,
} from "../services/dashboardApi.js";

const hoursFromMs = (ms = 0) => (ms ? `${Math.max(1, Math.round(ms / 1000 / 60 / 60))}h` : "0h");

const AgentDashboard = () => {
  const overview = useOverviewQuery(undefined, { pollingInterval: 60000 });
  const status = useStatusChartQuery(undefined, { pollingInterval: 60000 });
  const priority = usePriorityChartQuery(undefined, { pollingInterval: 60000 });
  const category = useCategoryChartQuery(undefined, { pollingInterval: 60000 });
  const activity = useRecentActivityQuery({ page: 1, limit: 12 }, { pollingInterval: 60000 });
  const data = overview.data?.data?.overview;
  const isFetching = overview.isFetching || status.isFetching || priority.isFetching || category.isFetching || activity.isFetching;

  const refreshAll = () => {
    overview.refetch();
    status.refetch();
    priority.refetch();
    category.refetch();
    activity.refetch();
  };

  if (overview.isFetching && !data) return <DashboardSkeleton />;

  const cards = [
    { label: "Total Tickets", value: data?.totalTickets, icon: Ticket },
    { label: "Open Tickets", value: data?.openTickets, icon: Inbox },
    { label: "In Progress", value: data?.inProgressTickets, icon: Clock3 },
    { label: "Resolved", value: data?.resolvedTickets, icon: CheckCircle2 },
    { label: "Closed", value: data?.closedTickets, icon: ListChecks },
    { label: "High Priority", value: data?.highPriorityTickets, icon: AlertTriangle },
    { label: "Urgent", value: data?.urgentTickets, icon: Flame },
    { label: "Assigned To Me", value: data?.myAssignedTickets, icon: UserCheck },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        eyebrow="Agent Dashboard"
        title="Support command center"
        description="Live operational view for ticket volume, urgency, assignment, and recent activity."
        onRefresh={refreshAll}
        isRefreshing={isFetching}
      />
      <DashboardCards cards={cards} />
      <div className="grid gap-4 lg:grid-cols-4">
        {[
          ["Average Resolution", hoursFromMs(data?.averageResolutionTimeMs), Timer],
          ["Pending Mine", data?.myPendingTickets || 0, Inbox],
          ["Created Today", data?.ticketsCreatedToday || 0, Ticket],
          ["Resolved Today", data?.ticketsResolvedToday || 0, CheckCircle2],
        ].map(([label, value, Icon]) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <Icon className="h-5 w-5 text-blue-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
          </Card>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6 lg:grid-cols-2">
          <AnalyticsChart title="Status Distribution" type="pie" data={(status.data?.data?.status || []).map((item) => ({ name: item.status, count: item.count }))} />
          <AnalyticsChart title="Priority Distribution" data={(priority.data?.data?.priority || []).map((item) => ({ name: item.priority, count: item.count }))} />
          <AnalyticsChart title="Category Distribution" data={(category.data?.data?.category || []).map((item) => ({ name: item.category, count: item.count }))} />
        </div>
        <RecentActivity activities={activity.data?.data?.activities || []} />
      </div>
    </motion.div>
  );
};

export default AgentDashboard;

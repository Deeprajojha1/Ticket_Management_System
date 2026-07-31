import { motion } from "framer-motion";
import AnalyticsChart from "../components/AnalyticsChart.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import DashboardSkeleton from "../components/DashboardSkeleton.jsx";
import {
  useCategoryChartQuery,
  useMonthlyChartQuery,
  usePriorityChartQuery,
  useStatusChartQuery,
} from "../services/dashboardApi.js";

const monthName = (item) => `${item.month}/${item.year}`;

const Analytics = () => {
  const status = useStatusChartQuery(undefined, { pollingInterval: 60000 });
  const priority = usePriorityChartQuery(undefined, { pollingInterval: 60000 });
  const category = useCategoryChartQuery(undefined, { pollingInterval: 60000 });
  const monthly = useMonthlyChartQuery(undefined, { pollingInterval: 60000 });
  const isFetching = status.isFetching || priority.isFetching || category.isFetching || monthly.isFetching;

  const refreshAll = () => {
    status.refetch();
    priority.refetch();
    category.refetch();
    monthly.refetch();
  };

  if (isFetching && !status.data) return <DashboardSkeleton />;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        eyebrow="Analytics"
        title="Support performance insights"
        description="Distribution and trend views update every 60 seconds while this page is open."
        onRefresh={refreshAll}
        isRefreshing={isFetching}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <AnalyticsChart title="Status Distribution" type="pie" data={(status.data?.data?.status || []).map((item) => ({ name: item.status, count: item.count }))} />
        <AnalyticsChart title="Priority Distribution" data={(priority.data?.data?.priority || []).map((item) => ({ name: item.priority, count: item.count }))} />
        <AnalyticsChart title="Category Distribution" data={(category.data?.data?.category || []).map((item) => ({ name: item.category, count: item.count }))} />
        <AnalyticsChart title="Monthly Ticket Trend" type="line" data={(monthly.data?.data?.monthly || []).map((item) => ({ name: monthName(item), count: item.count }))} />
      </div>
    </motion.div>
  );
};

export default Analytics;

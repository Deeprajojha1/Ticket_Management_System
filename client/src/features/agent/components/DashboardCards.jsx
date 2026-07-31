import { motion } from "framer-motion";
import Card from "../../../components/common/Card/Card.jsx";

const DashboardCards = ({ cards = [] }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {cards.map(({ icon: Icon, label, value, hint }) => (
      <motion.div key={label} whileHover={{ y: -3 }}>
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="mt-3 text-3xl font-bold text-slate-950">{value ?? 0}</p>
              <p className="mt-2 text-xs font-medium text-green-700">{hint || "+0% from last period"}</p>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
              <Icon className="h-5 w-5" />
            </span>
          </div>
        </Card>
      </motion.div>
    ))}
  </div>
);

export default DashboardCards;

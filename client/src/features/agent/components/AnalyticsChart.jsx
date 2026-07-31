import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card from "../../../components/common/Card/Card.jsx";
import { CHART_COLORS } from "../constants.js";

const AnalyticsChart = ({ title, data = [], type = "bar", dataKey = "count", nameKey = "name" }) => (
  <Card className="p-5">
    <h3 className="text-base font-semibold text-slate-950">{title}</h3>
    <div className="mt-4 h-72">
      <ResponsiveContainer width="100%" height="100%">
        {type === "pie" ? (
          <PieChart>
            <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={62} outerRadius={96} paddingAngle={3}>
              {data.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        ) : type === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey={dataKey} stroke="#2563eb" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={nameKey} tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey={dataKey} radius={[6, 6, 0, 0]}>
              {data.map((_, index) => <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  </Card>
);

export default AnalyticsChart;

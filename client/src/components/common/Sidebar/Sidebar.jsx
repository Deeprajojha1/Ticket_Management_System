import { NavLink } from "../../../lib/router.jsx";

const Sidebar = ({ items = [] }) => (
  <aside className="hidden w-64 border-r border-slate-200 bg-white lg:block">
    <div className="sticky top-0 space-y-1 p-4">
      {items.map(({ icon: Icon, label, to }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `focus-ring flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
              isActive ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-100"
            }`
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </div>
  </aside>
);

export default Sidebar;

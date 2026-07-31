import { NavLink } from "../../../lib/router.jsx";

const Sidebar = ({ footer, items = [] }) => (
  <aside className="hidden h-full w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
    <div className="flex-1 space-y-1 overflow-y-auto p-4">
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
    {footer ? <div className="border-t border-slate-200 p-4">{footer}</div> : null}
  </aside>
);

export default Sidebar;

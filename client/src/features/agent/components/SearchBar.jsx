import { Search } from "lucide-react";

const SearchBar = ({ value, onChange }) => (
  <label className="relative block">
    <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search ticket, customer, title, description"
      className="focus-ring min-h-11 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 text-sm outline-none"
    />
  </label>
);

export default SearchBar;

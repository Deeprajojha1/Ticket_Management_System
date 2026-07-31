import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import ConversationCard from "./ConversationCard.jsx";

const ConversationSidebar = ({ activeConversationId, conversations = [], onDelete, onSelect }) => {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => conversations.filter((conversation) => conversation.title?.toLowerCase().includes(search.toLowerCase())),
    [conversations, search],
  );

  return (
    <aside className="hidden min-h-0 w-80 shrink-0 flex-col border-r border-slate-200 bg-slate-50 p-4 lg:flex">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search conversations"
          className="focus-ring min-h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none"
        />
      </div>
      <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto">
        {filtered.map((conversation) => (
          <ConversationCard
            key={conversation._id}
            conversation={conversation}
            isActive={activeConversationId === conversation._id}
            onDelete={onDelete}
            onSelect={onSelect}
          />
        ))}
      </div>
    </aside>
  );
};

export default ConversationSidebar;

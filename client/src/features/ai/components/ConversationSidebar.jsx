import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import ConversationCard from "./ConversationCard.jsx";

const ConversationSidebar = ({ activeConversationId, compact = false, conversations = [], onClose, onDelete, onSelect }) => {
  const [search, setSearch] = useState("");
  const filtered = useMemo(
    () => conversations.filter((conversation) => conversation.title?.toLowerCase().includes(search.toLowerCase())),
    [conversations, search],
  );

  const content = (
    <>
      {compact ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-950">Previous chats</h3>
          <button type="button" className="focus-ring rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={onClose} aria-label="Close previous chats">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}
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
        {filtered.length ? filtered.map((conversation) => (
          <ConversationCard
            key={conversation._id}
            conversation={conversation}
            isActive={activeConversationId === conversation._id}
            onDelete={onDelete}
            onSelect={onSelect}
          />
        )) : (
          <p className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-6 text-center text-sm text-slate-500">No previous chats.</p>
        )}
      </div>
    </>
  );

  if (compact) {
    return (
      <aside className="absolute inset-y-0 left-0 z-20 flex w-[min(84vw,320px)] min-h-0 flex-col border-r border-slate-200 bg-slate-50 p-3 shadow-xl">
        {content}
      </aside>
    );
  }

  return (
    <aside className="hidden min-h-0 w-80 shrink-0 flex-col border-r border-slate-200 bg-slate-50 p-4 lg:flex">
      {content}
    </aside>
  );
};

export default ConversationSidebar;

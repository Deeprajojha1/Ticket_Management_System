import { Trash2 } from "lucide-react";
import { formatDate } from "../../tickets/utils.js";

const ConversationCard = ({ conversation, isActive, onDelete, onSelect }) => (
  <button
    className={`focus-ring w-full rounded-lg border p-3 text-left transition ${isActive ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
    onClick={() => onSelect(conversation)}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{conversation.title}</p>
        <p className="mt-1 text-xs text-slate-500">{formatDate(conversation.lastMessageAt, { withTime: true })}</p>
      </div>
      <span
        role="button"
        tabIndex={0}
        className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(conversation);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") onDelete(conversation);
        }}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </span>
    </div>
  </button>
);

export default ConversationCard;

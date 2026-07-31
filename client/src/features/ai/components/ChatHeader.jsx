import { Copy, FileDown, Plus, Trash2, X } from "lucide-react";
import Button from "../../../components/common/Button/Button.jsx";
import ConnectionStatus from "../../../components/ConnectionStatus.jsx";
import AIAvatar from "./AIAvatar.jsx";

const compactButtonClass =
  "focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50";

const ChatHeader = ({ compact = false, onClose, onCopyConversation, onExportPdf, onNewChat, onClear }) => (
  <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
    <div className="flex min-w-0 items-center gap-3">
      <AIAvatar />
      <div className="min-w-0">
        <h2 className="truncate text-base font-bold text-slate-950">{compact ? "AI Assistant" : "SupportDesk AI Assistant"}</h2>
        <p className="text-xs text-slate-500">Context-aware ticket support</p>
      </div>
    </div>
    <div className="flex shrink-0 items-center gap-2">
      {!compact ? <ConnectionStatus /> : null}
      {compact ? (
        <>
          <button type="button" className={compactButtonClass} onClick={onCopyConversation} aria-label="Copy conversation"><Copy className="h-4 w-4" /></button>
          <button type="button" className={compactButtonClass} onClick={onExportPdf} aria-label="Download PDF"><FileDown className="h-4 w-4" /></button>
          <button type="button" className={compactButtonClass} onClick={onClear} aria-label="Clear chat"><Trash2 className="h-4 w-4" /></button>
          <button type="button" className="focus-ring inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-blue-700" onClick={onNewChat}>
            <Plus className="h-4 w-4" />
            New
          </button>
          <button type="button" className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm hover:bg-slate-800" onClick={onClose} aria-label="Close assistant">
            <X className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <Button variant="ghost" onClick={onCopyConversation} aria-label="Copy conversation"><Copy className="h-4 w-4" /></Button>
          <Button variant="ghost" onClick={onExportPdf} aria-label="Download PDF"><FileDown className="h-4 w-4" /></Button>
          <Button variant="ghost" onClick={onClear} aria-label="Clear chat"><Trash2 className="h-4 w-4" /></Button>
          <Button onClick={onNewChat}><Plus className="h-4 w-4" /> New</Button>
        </>
      )}
    </div>
  </header>
);

export default ChatHeader;

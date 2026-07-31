import { Copy, FileDown, Plus, Trash2 } from "lucide-react";
import Button from "../../../components/common/Button/Button.jsx";
import ConnectionStatus from "../../../components/ConnectionStatus.jsx";
import AIAvatar from "./AIAvatar.jsx";

const ChatHeader = ({ onCopyConversation, onExportMarkdown, onNewChat, onClear }) => (
  <header className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
    <div className="flex min-w-0 items-center gap-3">
      <AIAvatar />
      <div className="min-w-0">
        <h2 className="truncate text-base font-bold text-slate-950">SupportDesk AI Assistant</h2>
        <p className="text-xs text-slate-500">Context-aware ticket support</p>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <ConnectionStatus />
      <Button variant="ghost" onClick={onCopyConversation} aria-label="Copy conversation"><Copy className="h-4 w-4" /></Button>
      <Button variant="ghost" onClick={onExportMarkdown} aria-label="Export markdown"><FileDown className="h-4 w-4" /></Button>
      <Button variant="ghost" onClick={onClear} aria-label="Clear chat"><Trash2 className="h-4 w-4" /></Button>
      <Button onClick={onNewChat}><Plus className="h-4 w-4" /> New</Button>
    </div>
  </header>
);

export default ChatHeader;

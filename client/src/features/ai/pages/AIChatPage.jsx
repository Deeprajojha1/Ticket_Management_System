import { motion } from "framer-motion";
import ChatWindow from "../components/ChatWindow.jsx";

const AIChatPage = () => (
  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl space-y-6">
    <div>
      <p className="text-sm font-semibold text-blue-700">AI Assistant</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-950">SupportDesk AI</h1>
      <p className="mt-2 text-sm text-slate-600">Ask context-aware questions about your tickets, comments, status, refunds, and support workflows.</p>
    </div>
    <ChatWindow />
  </motion.div>
);

export default AIChatPage;

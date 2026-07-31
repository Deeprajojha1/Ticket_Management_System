import { motion } from "framer-motion";

const TypingIndicator = ({ user }) => {
  if (!user) return null;

  const label = user.role === "agent" ? "Support Agent" : user.fullName || "Customer";

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-slate-500">
      <span>{label} is typing</span>
      <span className="flex gap-1">
        {[0, 1, 2].map((dot) => (
          <span key={dot} className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-500" />
        ))}
      </span>
    </motion.div>
  );
};

export default TypingIndicator;

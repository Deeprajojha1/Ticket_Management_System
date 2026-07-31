import { motion } from "framer-motion";
import AIAvatar from "./AIAvatar.jsx";
import ChatBubble from "./ChatBubble.jsx";
import UserAvatar from "./UserAvatar.jsx";

const ChatMessage = ({ message, speech }) => {
  const isUser = message.role === "user";

  return (
    <motion.article initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      {isUser ? <UserAvatar /> : <AIAvatar />}
      <ChatBubble message={message} speech={speech} />
    </motion.article>
  );
};

export default ChatMessage;

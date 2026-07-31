import ReactMarkdown from "react-markdown";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { formatDate } from "../../tickets/utils.js";
import MessageActions from "./MessageActions.jsx";

const ChatBubble = ({ message, speech }) => {
  const isUser = message.role === "user";
  const content = message.content || "";

  return (
    <div className={`max-w-[86%] rounded-2xl px-4 py-3 shadow-sm ${isUser ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-800"}`}>
      <div className={`prose prose-sm max-w-none ${isUser ? "prose-invert" : ""}`}>
        <ReactMarkdown
          components={{
            code({ inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter style={oneLight} language={match[1]} PreTag="div" {...props}>
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>{children}</code>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
      <p className={`mt-2 text-xs ${isUser ? "text-blue-100" : "text-slate-400"}`}>{formatDate(message.createdAt || new Date(), { withTime: true })}</p>
      <MessageActions content={content} isAssistant={!isUser} speech={speech} />
    </div>
  );
};

export default ChatBubble;

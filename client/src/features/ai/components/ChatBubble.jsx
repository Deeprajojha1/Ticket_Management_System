import ReactMarkdown from "react-markdown";
import { PrismAsyncLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { formatDate } from "../../tickets/utils.js";
import MessageActions from "./MessageActions.jsx";

const ChatBubble = ({ message, onRetry, speech }) => {
  const isUser = message.role === "user";
  const isFailed = message.status === "failed";
  const content = message.content || "";

  return (
    <div className={`max-w-[86%] rounded-2xl px-4 py-3 shadow-sm ${isFailed ? "border border-rose-200 bg-rose-50 text-slate-800" : isUser ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-800"}`}>
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
      {isFailed ? <p className="mt-2 text-xs font-semibold text-rose-700">{message.errorMessage || "Message failed. Try sending it again."}</p> : null}
      <p className={`mt-2 text-xs ${isFailed ? "text-rose-500" : isUser ? "text-blue-100" : "text-slate-400"}`}>{formatDate(message.createdAt || new Date(), { withTime: true })}</p>
      <MessageActions content={content} isAssistant={!isUser && !isFailed} onRetry={isFailed ? onRetry : undefined} speech={speech} />
    </div>
  );
};

export default ChatBubble;

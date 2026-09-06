import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import AttachmentPreview from "../../../features/tickets/components/AttachmentPreview.jsx";
import TicketEmptyState from "../../../features/tickets/components/TicketEmptyState.jsx";
import { formatDate, getInitials } from "../../../features/tickets/utils.js";

const ConversationMessage = ({ comment, currentUserId, onRetry, ticketId }) => {
  const userRole = comment.user?.role;
  const isCustomer = userRole ? userRole === "customer" : comment.user?._id === currentUserId || comment.user?.id === currentUserId;
  const authorName = comment.user?.fullName || "Support user";
  const isFailed = comment.status === "failed";

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex min-w-0 gap-3 ${isCustomer ? "flex-row-reverse" : ""}`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isCustomer ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"}`}>
        {getInitials(authorName)}
      </div>
      <div className={`min-w-0 max-w-[82%] rounded-lg border p-3 ${isFailed ? "border-rose-200 bg-rose-50" : isCustomer ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
        <div className={`flex flex-wrap items-center gap-2 ${isCustomer ? "justify-end" : ""}`}>
          <p className="min-w-0 truncate text-sm font-semibold text-slate-900">{authorName}</p>
          <span className="shrink-0 text-xs text-slate-500">{formatDate(comment.createdAt, { withTime: true })}</span>
        </div>
        <p className="mt-2 break-words whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.message}</p>
        {comment.attachments?.length ? (
          <div className="mt-3 grid gap-2">
            {comment.attachments.map((attachment, index) => (
              <AttachmentPreview
                key={attachment.public_id || attachment.url}
                attachment={attachment}
                attachmentIndex={index}
                commentId={comment._id}
                ticketId={ticketId}
                variant={attachment.mimeType?.startsWith("image/") ? "chat" : "card"}
              />
            ))}
          </div>
        ) : null}
        {isFailed ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-rose-700">
            <span className="font-semibold">{comment.errorMessage || "Reply failed. Try again."}</span>
            <button
              type="button"
              onClick={onRetry}
              className="focus-ring inline-flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2 py-1 font-semibold hover:bg-rose-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Resend
            </button>
          </div>
        ) : null}
      </div>
    </motion.article>
  );
};

const ConversationThread = ({ className = "", comments = [], currentUserId, emptyDescription, emptyTitle, onRetryComment, ticketId }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [comments.length]);

  return (
    <div ref={containerRef} className={`min-h-0 overflow-y-auto pr-1 ${className || "max-h-[560px]"}`}>
      {!comments.length ? (
        <TicketEmptyState
          title={emptyTitle || "No comments yet"}
          description={emptyDescription || "Start the conversation with a clear update or follow-up."}
        />
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <ConversationMessage
              key={comment._id}
              comment={comment}
              currentUserId={currentUserId}
              onRetry={comment.retryPayload ? () => onRetryComment?.(comment) : undefined}
              ticketId={ticketId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationThread;

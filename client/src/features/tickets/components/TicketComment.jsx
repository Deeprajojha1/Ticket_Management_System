import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import AttachmentPreview from "./AttachmentPreview.jsx";
import { formatDate, getInitials } from "../utils.js";

const TicketComment = ({ comment, currentUserId, onRetry, ticketId }) => {
  const isMine = comment.user?._id === currentUserId || comment.user?.id === currentUserId;
  const authorName = comment.user?.fullName || "Support user";
  const isFailed = comment.status === "failed";

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isMine ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"}`}>
        {getInitials(authorName)}
      </div>
      <div className={`max-w-[82%] rounded-lg border p-3 ${isFailed ? "border-rose-200 bg-rose-50" : isMine ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
        <div className={`flex flex-wrap items-center gap-2 ${isMine ? "justify-end" : ""}`}>
          <p className="text-sm font-semibold text-slate-900">{authorName}</p>
          <span className="text-xs text-slate-500">{formatDate(comment.createdAt, { withTime: true })}</span>
        </div>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{comment.message}</p>
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

export default TicketComment;

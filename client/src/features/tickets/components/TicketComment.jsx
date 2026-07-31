import { motion } from "framer-motion";
import AttachmentPreview from "./AttachmentPreview.jsx";
import { formatDate, getInitials } from "../utils.js";

const TicketComment = ({ comment, currentUserId, ticketId }) => {
  const isMine = comment.user?._id === currentUserId || comment.user?.id === currentUserId;
  const authorName = comment.user?.fullName || "Support user";

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isMine ? "flex-row-reverse" : ""}`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${isMine ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-700"}`}>
        {getInitials(authorName)}
      </div>
      <div className={`max-w-[82%] rounded-lg border p-3 ${isMine ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white"}`}>
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
      </div>
    </motion.article>
  );
};

export default TicketComment;

import { useEffect, useRef } from "react";
import TicketEmptyState from "./TicketEmptyState.jsx";
import TicketComment from "./TicketComment.jsx";

const CommentList = ({ className = "", comments = [], currentUserId, ticketId }) => {
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
        <TicketEmptyState title="No comments yet" description="Start the conversation with a clear update or follow-up." />
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <TicketComment key={comment._id} comment={comment} currentUserId={currentUserId} ticketId={ticketId} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;

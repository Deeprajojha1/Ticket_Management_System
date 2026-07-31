import { useEffect, useRef } from "react";
import TicketEmptyState from "./TicketEmptyState.jsx";
import TicketComment from "./TicketComment.jsx";

const CommentList = ({ comments = [], currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments.length]);

  if (!comments.length) {
    return <TicketEmptyState title="No comments yet" description="Start the conversation with a clear update or follow-up." />;
  }

  return (
    <div className="max-h-[560px] space-y-4 overflow-y-auto pr-1">
      {comments.map((comment) => (
        <TicketComment key={comment._id} comment={comment} currentUserId={currentUserId} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default CommentList;

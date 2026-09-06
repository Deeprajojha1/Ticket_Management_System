import { useState } from "react";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import ConversationThread from "../../../components/common/ConversationThread/ConversationThread.jsx";
import TypingIndicator from "../../../components/TypingIndicator.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import { useTyping } from "../../../hooks/useTyping.js";
import CommentInput from "./CommentInput.jsx";
import { useCreateCommentMutation, useGetCommentsQuery } from "../services/ticketApi.js";
import { getApiErrorMessage } from "../utils.js";

const CustomerTicketConversation = ({ ticket, ticketId }) => {
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [failedComments, setFailedComments] = useState([]);
  const { data: commentsData, isFetching } = useGetCommentsQuery({ ticketId, page: 1, limit: 50, sort: "oldest" }, { skip: !ticketId });
  const [createComment, { isLoading: isSending }] = useCreateCommentMutation();
  const { emitTyping, stopTyping, typingUser } = useTyping(ticketId);
  const comments = [...(commentsData?.data?.comments || []), ...failedComments];
  const isConversationLocked = ["Resolved", "Closed"].includes(ticket?.status);

  const handleComment = async (values, retryId) => {
    setUploadProgress(0);
    if (retryId) setFailedComments((current) => current.filter((comment) => comment._id !== retryId));
    try {
      await createComment({
        ticketId,
        payload: values,
        onUploadProgress: (event) => {
          if (event.total) setUploadProgress(Math.round((event.loaded * 100) / event.total));
        },
      }).unwrap();
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, "Could not add comment");
      setFailedComments((current) => [
        ...current,
        {
          _id: `failed-comment-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAt: new Date().toISOString(),
          message: values.message,
          attachments: [],
          status: "failed",
          errorMessage,
          retryPayload: values,
          user,
        },
      ]);
      toast.error(errorMessage);
      throw error;
    } finally {
      setUploadProgress(0);
    }
  };

  const retryComment = (comment) => handleComment(comment.retryPayload, comment._id);

  return (
    <div className="flex max-h-[min(720px,calc(100vh-160px))] min-h-[520px] flex-col">
      <div className="mb-4 flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-950">Conversation</h2>
          <p className="text-xs text-slate-500">
            {isFetching ? "Refreshing messages..." : `${comments.length} message${comments.length === 1 ? "" : "s"}`}
          </p>
        </div>
      </div>
      <ConversationThread
        className="flex-1"
        comments={comments}
        currentUserId={user?._id || user?.id}
        onRetryComment={retryComment}
        ticketId={ticketId}
      />
      <div className="my-3 shrink-0">
        <TypingIndicator user={typingUser} />
      </div>
      {isConversationLocked ? (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <span>This ticket is {ticket.status.toLowerCase()}, so the conversation is locked.</span>
        </div>
      ) : null}
      <CommentInput
        disabled={isConversationLocked}
        isLoading={isSending}
        onSubmit={handleComment}
        onTyping={emitTyping}
        onStopTyping={stopTyping}
        uploadProgress={uploadProgress}
      />
    </div>
  );
};

export default CustomerTicketConversation;

import { useState } from "react";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import Card from "../../../components/common/Card/Card.jsx";
import ConversationThread from "../../../components/common/ConversationThread/ConversationThread.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import CommentInput from "../../tickets/components/CommentInput.jsx";
import TicketEmptyState from "../../tickets/components/TicketEmptyState.jsx";
import { useCreateCommentMutation, useGetCommentsQuery } from "../../tickets/services/ticketApi.js";
import { getApiErrorMessage } from "../../tickets/utils.js";

const getEntityId = (value) => value?._id || value?.id || value?.toString?.();

const AgentTicketConversation = ({ ticket }) => {
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [failedComments, setFailedComments] = useState([]);
  const ticketId = getEntityId(ticket);
  const currentUserId = getEntityId(user);
  const assignedAgentId = getEntityId(ticket?.assignedAgent);
  const isConversationLocked = ["Resolved", "Closed"].includes(ticket?.status);
  const canReply = assignedAgentId && assignedAgentId === currentUserId && !isConversationLocked;
  const { data, isFetching, isLoading } = useGetCommentsQuery({ ticketId, page: 1, limit: 50, sort: "oldest" }, { skip: !ticketId });
  const [createComment, { isLoading: isSending }] = useCreateCommentMutation();
  const comments = [...(data?.data?.comments || []), ...failedComments];
  const showInitialLoader = isLoading && !comments.length;

  const handleComment = async (values, retryId) => {
    setUploadProgress(0);
    if (retryId) setFailedComments((current) => current.filter((comment) => comment._id !== retryId));
    try {
      await createComment({
        ticketId,
        payload: values,
        onUploadProgress: (event) => {
          if (event.total) {
            setUploadProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      }).unwrap();
    } catch (error) {
      const errorMessage = getApiErrorMessage(error, "Could not send reply");
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
    <Card className="flex max-h-[min(720px,calc(100vh-120px))] min-h-[520px] flex-col p-4 sm:p-5">
      <div className="mb-4 flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Conversation</h3>
          <p className="text-xs text-slate-500">
            {showInitialLoader ? "Loading messages..." : isFetching ? "Refreshing messages..." : `${comments.length} message${comments.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {isConversationLocked ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <Lock className="h-3.5 w-3.5" />
            Locked
          </span>
        ) : !canReply ? (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Assign ticket to reply
          </span>
        ) : null}
      </div>

      {showInitialLoader ? (
        <div className="flex flex-1 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
          <div className="flex flex-col items-center gap-3 text-sm font-semibold text-slate-600">
            <ClipLoader color="#2563eb" size={34} speedMultiplier={0.9} />
            <span>Loading chat...</span>
          </div>
        </div>
      ) : (
        <ConversationThread
          className="flex-1"
          comments={comments}
          currentUserId={currentUserId}
          onRetryComment={retryComment}
          ticketId={ticketId}
        />
      )}

      <div className="mt-4 shrink-0 border-t border-slate-200 pt-4">
        {canReply ? (
          <CommentInput isLoading={isSending} onSubmit={handleComment} uploadProgress={uploadProgress} />
        ) : isConversationLocked ? (
          <TicketEmptyState
            compact
            title="Conversation locked"
            description={`This ticket is ${ticket.status.toLowerCase()}. Reopen it before sending more replies.`}
          />
        ) : (
          <TicketEmptyState
            compact
            title="Agent reply locked"
            description="Assign this ticket to yourself before sending a customer reply."
          />
        )}
      </div>
    </Card>
  );
};

export default AgentTicketConversation;

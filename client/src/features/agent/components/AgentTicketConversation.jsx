import { useState } from "react";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../../components/common/Card/Card.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import CommentInput from "../../tickets/components/CommentInput.jsx";
import CommentList from "../../tickets/components/CommentList.jsx";
import TicketEmptyState from "../../tickets/components/TicketEmptyState.jsx";
import { useCreateCommentMutation, useGetCommentsQuery } from "../../tickets/services/ticketApi.js";
import { getApiErrorMessage } from "../../tickets/utils.js";

const getEntityId = (value) => value?._id || value?.id || value?.toString?.();

const AgentTicketConversation = ({ ticket }) => {
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const ticketId = getEntityId(ticket);
  const currentUserId = getEntityId(user);
  const assignedAgentId = getEntityId(ticket?.assignedAgent);
  const isConversationLocked = ["Resolved", "Closed"].includes(ticket?.status);
  const canReply = assignedAgentId && assignedAgentId === currentUserId && !isConversationLocked;
  const { data, isFetching } = useGetCommentsQuery({ ticketId, page: 1, limit: 50, sort: "oldest" }, { skip: !ticketId });
  const [createComment, { isLoading: isSending }] = useCreateCommentMutation();
  const comments = data?.data?.comments || [];

  const handleComment = async (values) => {
    setUploadProgress(0);
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
      toast.error(getApiErrorMessage(error, "Could not send reply"));
      throw error;
    } finally {
      setUploadProgress(0);
    }
  };

  return (
    <Card className="flex max-h-[min(720px,calc(100vh-120px))] min-h-[520px] flex-col p-4 sm:p-5">
      <div className="mb-4 flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Conversation</h3>
          <p className="text-xs text-slate-500">
            {isFetching ? "Refreshing messages..." : `${comments.length} message${comments.length === 1 ? "" : "s"}`}
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

      <CommentList className="flex-1" comments={comments} currentUserId={currentUserId} ticketId={ticketId} />

      <div className="mt-4 shrink-0 border-t border-slate-200 pt-4">
        {canReply ? (
          <CommentInput isLoading={isSending} onSubmit={handleComment} uploadProgress={uploadProgress} />
        ) : isConversationLocked ? (
          <TicketEmptyState
            title="Conversation locked"
            description={`This ticket is ${ticket.status.toLowerCase()}. Reopen it before sending more replies.`}
          />
        ) : (
          <TicketEmptyState
            title="Agent reply locked"
            description="Assign this ticket to yourself before sending a customer reply."
          />
        )}
      </div>
    </Card>
  );
};

export default AgentTicketConversation;

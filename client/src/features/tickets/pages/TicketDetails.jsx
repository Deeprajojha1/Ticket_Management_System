import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useParams } from "../../../lib/router.jsx";
import Button from "../../../components/common/Button/Button.jsx";
import Card from "../../../components/common/Card/Card.jsx";
import Loader from "../../../components/common/Loader/Loader.jsx";
import TypingIndicator from "../../../components/TypingIndicator.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import { useTyping } from "../../../hooks/useTyping.js";
import CommentInput from "../components/CommentInput.jsx";
import CommentList from "../components/CommentList.jsx";
import TicketDetailsCard from "../components/TicketDetailsCard.jsx";
import TicketTimeline from "../components/TicketTimeline.jsx";
import { useCreateCommentMutation, useGetCommentsQuery, useGetTicketQuery } from "../services/ticketApi.js";
import { getApiErrorMessage } from "../utils.js";

const TicketDetails = () => {
  const { ticketId } = useParams();
  const { user } = useAuth();
  const [uploadProgress, setUploadProgress] = useState(0);
  const { data, isFetching, isError, refetch } = useGetTicketQuery(ticketId);
  const { data: commentsData, isFetching: isCommentsFetching } = useGetCommentsQuery({ ticketId, page: 1, limit: 50 });
  const [createComment, { isLoading: isSending }] = useCreateCommentMutation();
  const { emitTyping, stopTyping, typingUser } = useTyping(ticketId);
  const ticket = data?.data?.ticket;
  const comments = commentsData?.data?.comments || [];

  const handleComment = async (values) => {
    setUploadProgress(0);
    try {
      await createComment({
        ticketId,
        payload: values,
        onUploadProgress: (event) => {
          if (event.total) setUploadProgress(Math.round((event.loaded * 100) / event.total));
        },
      }).unwrap();
      toast.success("Comment added");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not add comment"));
      throw error;
    } finally {
      setUploadProgress(0);
    }
  };

  if (isFetching) return <Loader label="Loading ticket" />;

  if (isError || !ticket) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-lg font-semibold text-red-800">Ticket could not be loaded</h1>
        <Button className="mt-4" variant="secondary" onClick={refetch}>Retry</Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-7xl space-y-6">
      <Link to="/customer/tickets" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700">
        <ArrowLeft className="h-4 w-4" />
        Back to tickets
      </Link>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <TicketDetailsCard ticket={ticket} />
          <Card className="p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-950">Comments</h2>
              {isCommentsFetching ? <span className="text-xs text-slate-500">Refreshing...</span> : null}
            </div>
            <CommentList comments={comments} currentUserId={user?._id || user?.id} />
            <div className="my-3">
              <TypingIndicator user={typingUser} />
            </div>
            <CommentInput
              isLoading={isSending}
              onSubmit={handleComment}
              onTyping={emitTyping}
              onStopTyping={stopTyping}
              uploadProgress={uploadProgress}
            />
          </Card>
        </div>
        <TicketTimeline activities={ticket.activityLog || []} />
      </div>
    </motion.div>
  );
};

export default TicketDetails;

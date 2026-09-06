import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Link, useLocation, useParams } from "../../../lib/router.jsx";
import Button from "../../../components/common/Button/Button.jsx";
import Loader from "../../../components/common/Loader/Loader.jsx";
import CustomerTicketConversation from "../components/CustomerTicketConversation.jsx";
import TicketDetailsCard from "../components/TicketDetailsCard.jsx";
import TicketTimeline from "../components/TicketTimeline.jsx";
import { useGetTicketQuery } from "../services/ticketApi.js";

const TicketDetails = () => {
  const { ticketId } = useParams();
  const { search } = useLocation();
  const { data, isLoading, isError, refetch } = useGetTicketQuery(ticketId);
  const ticket = data?.data?.ticket;
  const view = new URLSearchParams(search).get("view");
  const showDetails = view !== "chat";
  const showChat = view !== "details";
  const isChatOnly = showChat && !showDetails;

  if (isLoading) return <Loader label="Loading ticket" />;

  if (isError || !ticket) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <h1 className="text-lg font-semibold text-red-800">Ticket could not be loaded</h1>
        <Button className="mt-4" variant="secondary" onClick={refetch}>
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className={`mx-auto space-y-6 ${isChatOnly ? "max-w-5xl" : "max-w-7xl"}`}>
      <Link to="/customer/tickets" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-700">
        <ArrowLeft className="h-4 w-4" />
        Back to tickets
      </Link>
      <div className={`grid gap-6 ${showDetails && showChat ? "xl:grid-cols-[1fr_360px]" : ""}`}>
        <div className="space-y-6">
          {showDetails ? <TicketDetailsCard ticket={ticket} /> : null}
          {showChat ? (
            <CustomerTicketConversation ticket={ticket} ticketId={ticketId} />
          ) : null}
        </div>
        {showDetails ? <TicketTimeline activities={ticket.activityLog || []} /> : null}
      </div>
    </motion.div>
  );
};

export default TicketDetails;

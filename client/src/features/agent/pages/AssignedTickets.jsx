import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../../../components/common/Button/Button.jsx";
import Modal from "../../../components/common/Modal/Modal.jsx";
import TicketDetailsCard from "../../tickets/components/TicketDetailsCard.jsx";
import TicketEmptyState from "../../tickets/components/TicketEmptyState.jsx";
import TicketSkeleton from "../../tickets/components/TicketSkeleton.jsx";
import { getApiErrorMessage } from "../../tickets/utils.js";
import AgentTicketConversation from "../components/AgentTicketConversation.jsx";
import AssignAgentModal from "../components/AssignAgentModal.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import TicketFilters from "../components/TicketFilters.jsx";
import TicketTable from "../components/TicketTable.jsx";
import { DEFAULT_AGENT_FILTERS } from "../constants.js";
import { exportTicketsCsv } from "../utils.js";
import { useAllTicketsQuery, useAssignTicketMutation, useAssignedTicketsQuery } from "../services/dashboardApi.js";

const AssignedTickets = () => {
  const [filters, setFilters] = useState(DEFAULT_AGENT_FILTERS);
  const [assignTarget, setAssignTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const queryParams = useMemo(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "")), [filters]);
  const assignedQuery = useAssignedTicketsQuery(queryParams, { pollingInterval: 60000 });
  const availableQuery = useAllTicketsQuery(queryParams, { pollingInterval: 60000 });
  const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();
  const assignedTickets = assignedQuery.data?.data?.tickets || [];
  const availableTickets = availableQuery.data?.data?.tickets || [];
  const showAvailableTickets = !assignedQuery.isFetching && !assignedTickets.length;
  const tickets = showAvailableTickets ? availableTickets : assignedTickets;
  const pagination = showAvailableTickets
    ? availableQuery.data?.data?.pagination || {}
    : assignedQuery.data?.data?.pagination || {};
  const isFetching = assignedQuery.isFetching || (showAvailableTickets && availableQuery.isFetching);
  const refetch = () => {
    assignedQuery.refetch();
    availableQuery.refetch();
  };

  const confirmAssign = async (agentId) => {
    try {
      await assignTicket({ ticketId: assignTarget._id, agentId }).unwrap();
      toast.success("Ticket assigned successfully");
      setAssignTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Assignment failed"));
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader eyebrow="Assigned Tickets" title="My assigned queue" description="Focus on tickets currently owned by you." onRefresh={refetch} isRefreshing={isFetching} />
      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => exportTicketsCsv(tickets)}>
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>
      {showAvailableTickets && availableTickets.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
          No ticket is assigned to this agent yet. Showing all tickets below; unassigned tickets can be assigned to you.
        </div>
      ) : null}
      <TicketFilters filters={filters} onChange={setFilters} />
      {isFetching ? <TicketSkeleton rows={6} /> : null}
      {!isFetching && tickets.length ? <TicketTable tickets={tickets} onAssign={setAssignTarget} onOpen={setDetailsTarget} /> : null}
      {!isFetching && !tickets.length ? <TicketEmptyState title="No tickets available" description="Assigned or unassigned tickets will appear here when customers create them." /> : null}
      <Pagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
      <AssignAgentModal isOpen={Boolean(assignTarget)} ticket={assignTarget} onClose={() => setAssignTarget(null)} onConfirm={confirmAssign} isLoading={isAssigning} />
      <Modal isOpen={Boolean(detailsTarget)} onClose={() => setDetailsTarget(null)} title="Ticket Details" size="xl">
        {detailsTarget ? (
          <div className="max-h-[75vh] space-y-4 overflow-y-auto pr-1">
            <TicketDetailsCard ticket={detailsTarget} />
            <AgentTicketConversation ticket={detailsTarget} />
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AssignedTickets;

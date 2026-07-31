import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import Button from "../../../components/common/Button/Button.jsx";
import Card from "../../../components/common/Card/Card.jsx";
import Modal from "../../../components/common/Modal/Modal.jsx";
import LiveStatusBadge from "../../../components/LiveStatusBadge.jsx";
import TicketDetailsCard from "../../tickets/components/TicketDetailsCard.jsx";
import TicketEmptyState from "../../tickets/components/TicketEmptyState.jsx";
import TicketSkeleton from "../../tickets/components/TicketSkeleton.jsx";
import { getApiErrorMessage } from "../../tickets/utils.js";
import AssignAgentModal from "../components/AssignAgentModal.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import TicketFilters from "../components/TicketFilters.jsx";
import TicketTable from "../components/TicketTable.jsx";
import { DEFAULT_AGENT_FILTERS } from "../constants.js";
import { useAllTicketsQuery, useAssignTicketMutation } from "../services/dashboardApi.js";
import { exportTicketsCsv } from "../utils.js";

const AgentTickets = ({ assignedOnly = false }) => {
  const [filters, setFilters] = useState(DEFAULT_AGENT_FILTERS);
  const [assignTarget, setAssignTarget] = useState(null);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const queryParams = useMemo(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "")), [filters]);
  const query = useAllTicketsQuery(queryParams, { pollingInterval: 60000 });
  const { data, isFetching, refetch } = query;
  const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();
  const tickets = data?.data?.tickets || [];
  const pagination = data?.data?.pagination || {};

  const confirmAssign = async () => {
    try {
      await assignTicket(assignTarget._id).unwrap();
      toast.success("Ticket assigned to you");
      setAssignTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Assignment failed"));
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader
        eyebrow={assignedOnly ? "Assigned Tickets" : "All Tickets"}
        title={assignedOnly ? "My assigned queue" : "Ticket management"}
        description="Search, filter, assign, and update support tickets from one operational surface."
        onRefresh={refetch}
        isRefreshing={isFetching}
      />
      <div className="flex justify-end">
        <div className="mr-auto">
          <LiveStatusBadge label="Realtime table" />
        </div>
        <Button variant="secondary" onClick={() => exportTicketsCsv(tickets)}>Export CSV</Button>
      </div>
      <TicketFilters filters={filters} onChange={setFilters} />
      {isFetching ? <TicketSkeleton rows={6} /> : null}
      {!isFetching && tickets.length ? <TicketTable tickets={tickets} onAssign={setAssignTarget} onOpen={setDetailsTarget} /> : null}
      {!isFetching && !tickets.length ? <TicketEmptyState title="No tickets found" description="Try a broader search or remove filters." /> : null}
      <Pagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
      <AssignAgentModal isOpen={Boolean(assignTarget)} ticket={assignTarget} onClose={() => setAssignTarget(null)} onConfirm={confirmAssign} isLoading={isAssigning} />
      <Modal isOpen={Boolean(detailsTarget)} onClose={() => setDetailsTarget(null)} title="Ticket Details">
        {detailsTarget ? (
          <div className="max-h-[75vh] overflow-y-auto">
            <TicketDetailsCard ticket={detailsTarget} />
            <Card className="mt-4 p-4">
              <p className="text-sm font-semibold text-slate-900">Customer</p>
              <p className="mt-1 text-sm text-slate-600">{detailsTarget.createdBy?.fullName} - {detailsTarget.createdBy?.email}</p>
            </Card>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AgentTickets;

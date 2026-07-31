import { useMemo, useState } from "react";
import Button from "../../../components/common/Button/Button.jsx";
import Modal from "../../../components/common/Modal/Modal.jsx";
import TicketDetailsCard from "../../tickets/components/TicketDetailsCard.jsx";
import TicketEmptyState from "../../tickets/components/TicketEmptyState.jsx";
import TicketSkeleton from "../../tickets/components/TicketSkeleton.jsx";
import DashboardHeader from "../components/DashboardHeader.jsx";
import Pagination from "../components/Pagination.jsx";
import TicketFilters from "../components/TicketFilters.jsx";
import TicketTable from "../components/TicketTable.jsx";
import { DEFAULT_AGENT_FILTERS } from "../constants.js";
import { exportTicketsCsv } from "../utils.js";
import { useAssignedTicketsQuery } from "../services/dashboardApi.js";

const AssignedTickets = () => {
  const [filters, setFilters] = useState(DEFAULT_AGENT_FILTERS);
  const [detailsTarget, setDetailsTarget] = useState(null);
  const queryParams = useMemo(() => Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "")), [filters]);
  const { data, isFetching, refetch } = useAssignedTicketsQuery(queryParams, { pollingInterval: 60000 });
  const tickets = data?.data?.tickets || [];
  const pagination = data?.data?.pagination || {};

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <DashboardHeader eyebrow="Assigned Tickets" title="My assigned queue" description="Focus on tickets currently owned by you." onRefresh={refetch} isRefreshing={isFetching} />
      <div className="flex justify-end"><Button variant="secondary" onClick={() => exportTicketsCsv(tickets)}>Export CSV</Button></div>
      <TicketFilters filters={filters} onChange={setFilters} />
      {isFetching ? <TicketSkeleton rows={6} /> : null}
      {!isFetching && tickets.length ? <TicketTable tickets={tickets} onAssign={() => {}} onOpen={setDetailsTarget} /> : null}
      {!isFetching && !tickets.length ? <TicketEmptyState title="No assigned tickets" description="Assigned tickets will appear here when you take ownership." /> : null}
      <Pagination pagination={pagination} onPageChange={(page) => setFilters((current) => ({ ...current, page }))} />
      <Modal isOpen={Boolean(detailsTarget)} onClose={() => setDetailsTarget(null)} title="Ticket Details">
        {detailsTarget ? (
          <div className="max-h-[75vh] overflow-y-auto">
            <TicketDetailsCard ticket={detailsTarget} />
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AssignedTickets;

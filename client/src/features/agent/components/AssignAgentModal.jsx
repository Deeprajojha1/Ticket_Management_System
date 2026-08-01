import { useMemo, useState } from "react";
import { UserCheck, Users, X } from "lucide-react";
import Modal from "../../../components/common/Modal/Modal.jsx";
import Button from "../../../components/common/Button/Button.jsx";
import { useAuth } from "../../../hooks/useAuth.js";
import { useAgentsQuery } from "../services/dashboardApi.js";

const AssignAgentModal = ({ isOpen, isLoading, onClose, onConfirm, ticket }) => {
  const { user } = useAuth();
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const { data, isFetching } = useAgentsQuery(undefined, { skip: !isOpen });
  const agents = data?.data?.agents || [];
  const currentUserId = user?._id || user?.id;

  const orderedAgents = useMemo(() => {
    const currentAgent = agents.find((agent) => agent._id === currentUserId);
    const otherAgents = agents.filter((agent) => agent._id !== currentUserId);
    return currentAgent ? [currentAgent, ...otherAgents] : agents;
  }, [agents, currentUserId]);

  const otherAgents = orderedAgents.filter((agent) => agent._id !== currentUserId);
  const effectiveAgentId = selectedAgentId || currentUserId;

  const handleClose = () => {
    setSelectedAgentId("");
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(effectiveAgentId);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Assign Ticket">
      <p className="text-sm leading-6 text-slate-600">
        Choose who should own {ticket?.ticketNumber}. The assigned agent can reply and manage this ticket.
      </p>

      <div className="mt-5 space-y-3">
        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <input
            type="radio"
            className="mt-1 h-4 w-4 accent-blue-600"
            checked={effectiveAgentId === currentUserId}
            onChange={() => setSelectedAgentId(currentUserId)}
          />
          <span>
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <UserCheck className="h-4 w-4 text-blue-700" />
              Assign to me
            </span>
            <span className="mt-1 block text-xs text-slate-600">{user?.fullName} - {user?.email}</span>
          </span>
        </label>

        {otherAgents.length ? (
          <div className="rounded-lg border border-slate-200 p-3">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Users className="h-4 w-4 text-slate-500" />
              Other agents
            </div>
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {otherAgents.map((agent) => (
                <label key={agent._id} className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-slate-50">
                  <input
                    type="radio"
                    className="mt-1 h-4 w-4 accent-blue-600"
                    checked={effectiveAgentId === agent._id}
                    onChange={() => setSelectedAgentId(agent._id)}
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{agent.fullName}</span>
                    <span className="block text-xs text-slate-500">{agent.email}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {isFetching ? "Loading agents..." : "No other active agents found."}
          </p>
        )}
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={handleClose}>
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={handleConfirm} isLoading={isLoading} disabled={!effectiveAgentId}>
          <UserCheck className="h-4 w-4" />
          Assign
        </Button>
      </div>
    </Modal>
  );
};

export default AssignAgentModal;

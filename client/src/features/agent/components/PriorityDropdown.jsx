import toast from "react-hot-toast";
import { TICKET_PRIORITIES } from "../../tickets/constants.js";
import { getApiErrorMessage } from "../../tickets/utils.js";
import { useUpdatePriorityMutation } from "../services/dashboardApi.js";

const PriorityDropdown = ({ ticket }) => {
  const [updatePriority, { isLoading }] = useUpdatePriorityMutation();

  const handleChange = async (priority) => {
    try {
      await updatePriority({ ticketId: ticket._id, priority }).unwrap();
      toast.success("Priority updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Priority update failed"));
    }
  };

  return (
    <select
      disabled={isLoading}
      value={ticket.priority}
      onChange={(event) => handleChange(event.target.value)}
      className="focus-ring min-h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold"
      aria-label={`Update priority for ${ticket.ticketNumber}`}
    >
      {TICKET_PRIORITIES.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
    </select>
  );
};

export default PriorityDropdown;

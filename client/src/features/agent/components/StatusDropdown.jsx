import toast from "react-hot-toast";
import { TICKET_STATUSES } from "../../tickets/constants.js";
import { getApiErrorMessage } from "../../tickets/utils.js";
import { useUpdateStatusMutation } from "../services/dashboardApi.js";

const StatusDropdown = ({ ticket }) => {
  const [updateStatus, { isLoading }] = useUpdateStatusMutation();

  const handleChange = async (status) => {
    try {
      await updateStatus({ ticketId: ticket._id, status }).unwrap();
      toast.success("Status updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Status update failed"));
    }
  };

  return (
    <select
      disabled={isLoading}
      value={ticket.status}
      onChange={(event) => handleChange(event.target.value)}
      className="focus-ring min-h-9 rounded-lg border border-slate-300 bg-white px-2 text-xs font-semibold"
      aria-label={`Update status for ${ticket.ticketNumber}`}
    >
      {TICKET_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
    </select>
  );
};

export default StatusDropdown;

import { motion } from "framer-motion";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "../../../lib/router.jsx";
import CreateTicketForm from "../components/CreateTicketForm.jsx";
import { useCreateTicketMutation } from "../services/ticketApi.js";
import { getApiErrorMessage, getTicketId } from "../utils.js";

const CreateTicket = () => {
  const navigate = useNavigate();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [createTicket, { isLoading }] = useCreateTicketMutation();

  const handleCreate = async (values) => {
    setUploadProgress(0);
    try {
      const response = await createTicket({
        payload: values,
        onUploadProgress: (event) => {
          if (event.total) setUploadProgress(Math.round((event.loaded * 100) / event.total));
        },
      }).unwrap();
      const ticket = response?.data?.ticket;
      toast.success(response?.message || "Ticket created successfully");
      navigate(`/customer/tickets/${getTicketId(ticket)}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not create ticket"));
    } finally {
      setUploadProgress(0);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-blue-700">Create Ticket</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Tell us what happened</h1>
        <p className="mt-2 text-sm text-slate-600">Add enough detail for the support team to triage your request quickly.</p>
      </div>
      <CreateTicketForm isLoading={isLoading} onSubmit={handleCreate} uploadProgress={uploadProgress} />
    </motion.div>
  );
};

export default CreateTicket;

import Modal from "../../../components/common/Modal/Modal.jsx";
import Button from "../../../components/common/Button/Button.jsx";

const AssignAgentModal = ({ isOpen, isLoading, onClose, onConfirm, ticket }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Assign Ticket">
    <p className="text-sm leading-6 text-slate-600">
      Assign {ticket?.ticketNumber} to yourself? This will move it into your assigned queue.
    </p>
    <div className="mt-5 flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button onClick={onConfirm} isLoading={isLoading}>Assign to me</Button>
    </div>
  </Modal>
);

export default AssignAgentModal;

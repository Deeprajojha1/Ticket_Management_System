import { X } from "lucide-react";

const Modal = ({ children, isOpen, onClose, title, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClass = {
    md: "max-w-md",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
  }[size] || "max-w-md";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className={`w-full ${sizeClass} rounded-lg bg-white shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            className="focus-ring rounded-md p-2 text-slate-500 hover:bg-slate-100"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default Modal;

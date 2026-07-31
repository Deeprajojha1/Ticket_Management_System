import { MessageCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ChatWindow from "./ChatWindow.jsx";

const AIChatWidget = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      {open ? (
        <motion.div
          drag
          dragMomentum={false}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-24 right-4 z-50 w-[calc(100vw-32px)] max-w-3xl rounded-lg bg-white shadow-2xl sm:right-6"
        >
          <div className="flex justify-end border-b border-slate-200 p-2">
            <button className="focus-ring rounded-md p-2 text-slate-500 hover:bg-slate-100" onClick={() => setOpen(false)} aria-label="Close assistant">
              <X className="h-4 w-4" />
            </button>
          </div>
          <ChatWindow compact />
        </motion.div>
      ) : null}
      <button
        className="focus-ring fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700"
        onClick={() => setOpen((value) => !value)}
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
};

export default AIChatWidget;

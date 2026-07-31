import { MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
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
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed bottom-4 right-4 z-50 w-[calc(100vw-32px)] origin-bottom-right overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-slate-200 sm:bottom-6 sm:right-6 sm:w-[460px] lg:hidden"
          >
            <ChatWindow compact onClose={() => setOpen(false)} />
          </motion.div>
        ) : null}
      </AnimatePresence>
      {!open ? (
        <button
          className="focus-ring fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 lg:hidden"
          onClick={() => setOpen(true)}
          aria-label="Open AI assistant"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      ) : null}
    </>
  );
};

export default AIChatWidget;

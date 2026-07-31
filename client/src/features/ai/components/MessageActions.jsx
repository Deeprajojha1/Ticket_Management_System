import { Copy, Pause, RotateCcw, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

const MessageActions = ({ content, isAssistant, speech }) => {
  const [feedback, setFeedback] = useState(null);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const submitFeedback = (value) => {
    setFeedback(value);
    toast.success(value === "like" ? "Marked as helpful" : "Feedback saved");
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1 text-slate-500">
      <button className="focus-ring rounded-md p-1.5 hover:bg-slate-100" type="button" onClick={copy} aria-label="Copy message">
        <Copy className="h-3.5 w-3.5" />
      </button>
      {isAssistant ? (
        <>
          <button
            className="focus-ring rounded-md p-1.5 hover:bg-slate-100 disabled:opacity-50"
            type="button"
            disabled={speech.isLoading}
            onClick={() => speech.play(content)}
            aria-label="Play voice"
          >
            <Volume2 className="h-3.5 w-3.5" />
          </button>
          <button
            className="focus-ring rounded-md p-1.5 hover:bg-slate-100 disabled:opacity-50"
            type="button"
            disabled={!speech.isPlaying}
            onClick={speech.pause}
            aria-label="Pause voice"
          >
            <Pause className="h-3.5 w-3.5" />
          </button>
          <button
            className="focus-ring rounded-md p-1.5 hover:bg-slate-100 disabled:opacity-50"
            type="button"
            disabled={!speech.activeText}
            onClick={speech.replay}
            aria-label="Replay voice"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button
            className={`focus-ring rounded-md p-1.5 hover:bg-slate-100 ${feedback === "like" ? "bg-emerald-50 text-emerald-700" : ""}`}
            type="button"
            onClick={() => submitFeedback("like")}
            aria-label="Like response"
            aria-pressed={feedback === "like"}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button
            className={`focus-ring rounded-md p-1.5 hover:bg-slate-100 ${feedback === "dislike" ? "bg-rose-50 text-rose-700" : ""}`}
            type="button"
            onClick={() => submitFeedback("dislike")}
            aria-label="Dislike response"
            aria-pressed={feedback === "dislike"}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </>
      ) : null}
    </div>
  );
};

export default MessageActions;

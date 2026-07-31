import { Copy, Pause, RotateCcw, ThumbsDown, ThumbsUp, Volume2 } from "lucide-react";
import toast from "react-hot-toast";

const MessageActions = ({ content, isAssistant, speech }) => {
  const copy = async () => {
    await navigator.clipboard.writeText(content);
    toast.success("Copied");
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1 text-slate-500">
      <button className="focus-ring rounded-md p-1.5 hover:bg-slate-100" onClick={copy} aria-label="Copy message">
        <Copy className="h-3.5 w-3.5" />
      </button>
      {isAssistant ? (
        <>
          <button className="focus-ring rounded-md p-1.5 hover:bg-slate-100" onClick={() => speech.play(content)} aria-label="Play voice">
            <Volume2 className="h-3.5 w-3.5" />
          </button>
          <button className="focus-ring rounded-md p-1.5 hover:bg-slate-100" onClick={speech.pause} aria-label="Pause voice">
            <Pause className="h-3.5 w-3.5" />
          </button>
          <button className="focus-ring rounded-md p-1.5 hover:bg-slate-100" onClick={speech.replay} aria-label="Replay voice">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
          <button className="focus-ring rounded-md p-1.5 hover:bg-slate-100" aria-label="Like response">
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button className="focus-ring rounded-md p-1.5 hover:bg-slate-100" aria-label="Dislike response">
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </>
      ) : null}
    </div>
  );
};

export default MessageActions;

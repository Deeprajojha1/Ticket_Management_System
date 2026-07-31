import { Paperclip, Send } from "lucide-react";
import { useRef, useState } from "react";
import Button from "../../../components/common/Button/Button.jsx";
import VoiceRecorder from "./VoiceRecorder.jsx";

const ChatInput = ({ disabled, isTranscribing, onSend, onTranscribe, value, onChange }) => {
  const [attachments, setAttachments] = useState([]);
  const fileRef = useRef(null);

  const submit = (event) => {
    event.preventDefault();
    if (!value.trim()) return;
    onSend({ message: value.trim(), attachments });
    setAttachments([]);
  };

  return (
    <form className="border-t border-slate-200 bg-white p-3" onSubmit={submit}>
      {attachments.length ? (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file) => (
            <span key={`${file.name}-${file.lastModified}`} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {file.name}
            </span>
          ))}
        </div>
      ) : null}
      <div className="flex items-end gap-2 rounded-xl border border-slate-300 bg-white p-2 shadow-sm">
        <textarea
          rows={1}
          maxLength={2000}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              submit(event);
            }
          }}
          className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
          placeholder="Ask about your tickets..."
        />
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".png,.jpg,.jpeg,.pdf"
          className="sr-only"
          onChange={(event) => setAttachments(Array.from(event.target.files || []).slice(0, 5))}
        />
        <Button variant="ghost" onClick={() => fileRef.current?.click()} aria-label="Attach file">
          <Paperclip className="h-4 w-4" />
        </Button>
        <VoiceRecorder isTranscribing={isTranscribing} onAudioReady={onTranscribe} />
        <Button type="submit" isLoading={disabled} aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="mt-1 text-right text-xs text-slate-500">{value.length}/2000</p>
    </form>
  );
};

export default ChatInput;

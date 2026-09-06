import { Send } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/common/Button/Button.jsx";
import FileUploader from "../../../components/common/FileUploader/FileUploader.jsx";
import VoiceRecorder from "./VoiceRecorder.jsx";

const ChatInput = ({ disabled, isTranscribing, onSend, onTranscribe, uploadProgress = 0, value, onChange }) => {
  const [attachments, setAttachments] = useState([]);

  const submit = (event) => {
    event.preventDefault();
    if (!value.trim()) return;
    onSend({ message: value.trim(), attachments });
    setAttachments([]);
  };

  return (
    <form className="border-t border-slate-200 bg-white p-2.5 sm:p-3" onSubmit={submit}>
      <div className="flex items-end gap-1.5 rounded-xl border border-slate-300 bg-white p-1.5 shadow-sm sm:gap-2 sm:p-2">
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
          className="max-h-40 min-h-10 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none"
          placeholder="Ask about your tickets..."
        />
        <VoiceRecorder isTranscribing={isTranscribing} onAudioReady={onTranscribe} />
        <Button type="submit" className="h-10 w-10 shrink-0 px-0" isLoading={disabled} aria-label="Send message">
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2">
        <FileUploader
          disabled={disabled}
          files={attachments}
          id="ai-chat-attachments"
          onChange={setAttachments}
          progress={disabled ? uploadProgress : 0}
          variant="compact"
        />
      </div>
      <p className="mt-1 text-right text-xs text-slate-500">{value.length}/2000</p>
    </form>
  );
};

export default ChatInput;

import { Mic, Square, X } from "lucide-react";
import Button from "../../../components/common/Button/Button.jsx";
import { useVoiceRecorder } from "../hooks/useVoiceRecorder.js";
import VoiceVisualizer from "./VoiceVisualizer.jsx";

const VoiceRecorder = ({ isTranscribing, onAudioReady }) => {
  const recorder = useVoiceRecorder();

  const stop = async () => {
    const blob = await recorder.stop();
    if (blob) onAudioReady(blob);
  };

  if (recorder.isRecording) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <VoiceVisualizer duration={recorder.duration} />
        <Button variant="secondary" onClick={stop} isLoading={isTranscribing} aria-label="Stop recording">
          <Square className="h-4 w-4" />
        </Button>
        <Button variant="ghost" onClick={recorder.cancel} aria-label="Cancel recording">
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="ghost"
      onClick={recorder.start}
      disabled={isTranscribing || !recorder.isSupported}
      aria-label="Record voice"
      title={recorder.isSupported ? "Record voice" : "Voice recording is not supported in this browser"}
    >
      <Mic className="h-4 w-4" />
    </Button>
  );
};

export default VoiceRecorder;

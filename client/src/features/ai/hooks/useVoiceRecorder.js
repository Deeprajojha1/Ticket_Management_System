import { useRef, useState } from "react";
import toast from "react-hot-toast";

export const useVoiceRecorder = () => {
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const [duration, setDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const isSupported =
    typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined";

  const start = async () => {
    if (!isSupported) {
      toast.error("Voice recording is not supported in this browser");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.start();
      setDuration(0);
      setIsRecording(true);
      timerRef.current = window.setInterval(() => setDuration((value) => value + 1), 1000);
    } catch {
      toast.error("Microphone permission denied");
    }
  };

  const stop = () =>
    new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder) {
        resolve(null);
        return;
      }
      recorder.onstop = () => {
        window.clearInterval(timerRef.current);
        recorder.stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);
        resolve(new Blob(chunksRef.current, { type: "audio/webm" }));
      };
      recorder.stop();
    });

  const cancel = () => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
    window.clearInterval(timerRef.current);
    setIsRecording(false);
    setDuration(0);
    chunksRef.current = [];
  };

  return { cancel, duration, isRecording, isSupported, start, stop };
};

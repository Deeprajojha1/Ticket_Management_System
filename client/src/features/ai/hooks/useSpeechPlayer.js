import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTextToSpeechMutation } from "../services/aiApi.js";

export const useSpeechPlayer = () => {
  const audioRef = useRef(null);
  const [activeText, setActiveText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [textToSpeech, { isLoading }] = useTextToSpeechMutation();

  const play = async (text) => {
    try {
      if (audioRef.current && activeText === text) {
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      }

      const response = await textToSpeech({ text }).unwrap();
      const audio = new Audio(response?.data?.audioUrl);
      audioRef.current = audio;
      setActiveText(text);
      audio.onended = () => setIsPlaying(false);
      await audio.play();
      setIsPlaying(true);
    } catch {
      toast.error("Audio playback failed");
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  const replay = async () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    await audioRef.current.play();
    setIsPlaying(true);
  };

  return { activeText, isLoading, isPlaying, pause, play, replay };
};

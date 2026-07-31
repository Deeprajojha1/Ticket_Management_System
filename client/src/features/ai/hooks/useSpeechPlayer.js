import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTextToSpeechMutation } from "../services/aiApi.js";

export const useSpeechPlayer = () => {
  const audioRef = useRef(null);
  const utteranceRef = useRef(null);
  const [activeText, setActiveText] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [textToSpeech, { isLoading }] = useTextToSpeechMutation();

  const playInBrowser = (text) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Voice playback is not supported in this browser");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    utteranceRef.current = utterance;
    setActiveText(text);
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  };

  const play = async (text) => {
    try {
      window.speechSynthesis?.cancel();

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
      playInBrowser(text);
    }
  };

  const pause = () => {
    audioRef.current?.pause();
    window.speechSynthesis?.pause();
    setIsPlaying(false);
  };

  const replay = async () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      await audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    if (activeText) {
      playInBrowser(activeText);
    }
  };

  return { activeText, isLoading, isPlaying, pause, play, replay };
};

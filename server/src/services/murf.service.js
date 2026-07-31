import axios from "axios";
import ApiError from "../utils/ApiError.js";

const MURF_BASE_URL = "https://api.murf.ai/v1";

export const generateSpeech = async (text) => {
  if (!process.env.MURF_API_KEY) {
    throw new ApiError(500, "Murf API key is not configured");
  }

  try {
    const response = await axios.post(
      `${MURF_BASE_URL}/speech/generate`,
      {
        text,
        voiceId: process.env.MURF_VOICE_ID || "en-US-natalie",
        style: process.env.MURF_STYLE || "Conversational",
        format: process.env.MURF_FORMAT || "MP3",
      },
      {
        headers: {
          "api-key": process.env.MURF_API_KEY,
          "content-type": "application/json",
        },
        timeout: 30000,
      },
    );

    const audioUrl = response.data?.audioFile || response.data?.audioUrl || response.data?.url;

    if (!audioUrl) {
      throw new ApiError(502, "Murf did not return an audio URL");
    }

    return audioUrl;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error(`Murf failed: ${error.message}`);
    throw new ApiError(502, "Murf service failed");
  }
};

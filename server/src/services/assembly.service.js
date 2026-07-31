import axios from "axios";
import ApiError from "../utils/ApiError.js";

const ASSEMBLY_BASE_URL = "https://api.assemblyai.com/v2";
const POLL_INTERVAL_MS = 2500;
const MAX_POLLS = 30;

const assemblyHeaders = () => {
  const apiKey = process.env.ASSEMBLYAI_API_KEY || process.env.ASSEMBLY_API_KEY;

  if (!apiKey) {
    throw new ApiError(500, "AssemblyAI API key is not configured");
  }

  return { authorization: apiKey };
};

export const transcribeAudioFile = async (file) => {
  if (!file) {
    throw new ApiError(400, "Audio file is required");
  }

  try {
    const uploadResponse = await axios.post(`${ASSEMBLY_BASE_URL}/upload`, file.buffer, {
      headers: {
        ...assemblyHeaders(),
        "content-type": "application/octet-stream",
      },
      timeout: 30000,
    });

    const transcriptResponse = await axios.post(
      `${ASSEMBLY_BASE_URL}/transcript`,
      { audio_url: uploadResponse.data.upload_url },
      { headers: assemblyHeaders(), timeout: 15000 },
    );

    const transcriptId = transcriptResponse.data.id;

    for (let attempt = 0; attempt < MAX_POLLS; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));

      const pollResponse = await axios.get(`${ASSEMBLY_BASE_URL}/transcript/${transcriptId}`, {
        headers: assemblyHeaders(),
        timeout: 15000,
      });

      if (pollResponse.data.status === "completed") {
        return pollResponse.data.text || "";
      }

      if (pollResponse.data.status === "error") {
        throw new ApiError(502, pollResponse.data.error || "AssemblyAI transcription failed");
      }
    }

    throw new ApiError(504, "AssemblyAI transcription timed out");
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error(`AssemblyAI failed: ${error.message}`);
    throw new ApiError(502, "AssemblyAI service failed");
  }
};

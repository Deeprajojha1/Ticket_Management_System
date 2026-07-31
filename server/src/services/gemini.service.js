import axios from "axios";
import ApiError from "../utils/ApiError.js";
import { formatAIReply } from "../utils/aiResponseFormatter.js";
import { SYSTEM_PROMPT } from "../utils/promptTemplates.js";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const GEMINI_TIMEOUT_MS = 30000;

export const generateGeminiReply = async ({ prompt, systemPrompt = SYSTEM_PROMPT }) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new ApiError(500, "Gemini API key is not configured");
  }

  const startedAt = Date.now();

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
      {
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 700,
        },
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
        timeout: GEMINI_TIMEOUT_MS,
      },
    );

    const text = response.data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n");

    console.log(`Gemini response time: ${Date.now() - startedAt}ms`);
    if (response.data?.usageMetadata) {
      console.log(`Gemini token usage: ${JSON.stringify(response.data.usageMetadata)}`);
    }

    return {
      reply: formatAIReply(text),
      usage: response.data?.usageMetadata || null,
      responseTimeMs: Date.now() - startedAt,
    };
  } catch (error) {
    const status = error.response?.status;

    if (error.code === "ECONNABORTED") {
      throw new ApiError(504, "Gemini request timed out");
    }

    if (status === 429) {
      throw new ApiError(429, "Gemini rate limit exceeded");
    }

    console.error(`Gemini API failed: ${error.message}`);
    throw new ApiError(502, "Gemini service failed");
  }
};

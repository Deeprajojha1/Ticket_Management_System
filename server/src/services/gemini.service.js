import axios from "axios";
import ApiError from "../utils/ApiError.js";
import { formatAIReply } from "../utils/aiResponseFormatter.js";
import { SYSTEM_PROMPT } from "../utils/promptTemplates.js";

const DEPRECATED_MODEL_ALIASES = new Set(["gemini-1.5-flash", "gemini-1.5-pro"]);
const configuredModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
const GEMINI_MODEL = DEPRECATED_MODEL_ALIASES.has(configuredModel)
  ? "gemini-3.5-flash-lite"
  : configuredModel;
const FALLBACK_MODELS = (process.env.GEMINI_FALLBACK_MODELS || "gemini-3.5-flash-lite")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);
const GEMINI_TIMEOUT_MS = 30000;
const GROQ_MODEL = process.env.GROQ_MODEL || "groq/compound-mini";
const GROQ_TIMEOUT_MS = 30000;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const getEnv = (...names) => {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) return value;
  }

  return "";
};

const getProviderErrorDetails = (provider, error) => ({
  provider,
  status: error.response?.status || null,
  code: error.code || null,
  message:
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.message ||
    "Unknown provider error",
});

const sleep = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const getRetryDelayMs = (error, attempt) => {
  const retryAfter = Number(error.response?.headers?.["retry-after"]);
  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.min(retryAfter * 1000, 8000);
  }

  return Math.min(800 * 2 ** attempt, 4000);
};

const buildModelList = () => [...new Set([GEMINI_MODEL, ...FALLBACK_MODELS])];

const requestGemini = ({ prompt, systemPrompt, model, apiKey }) =>
  axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
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
      params: { key: apiKey },
      timeout: GEMINI_TIMEOUT_MS,
    },
  );

const requestGroq = ({ prompt, systemPrompt }) =>
  axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.4,
      max_tokens: 700,
    },
    {
      headers: {
        Authorization: `Bearer ${getEnv("GROQ_API_KEY")}`,
        "Content-Type": "application/json",
      },
      timeout: GROQ_TIMEOUT_MS,
    },
  );

const generateGroqReply = async ({ prompt, systemPrompt, startedAt, previousErrors = [] }) => {
  if (!getEnv("GROQ_API_KEY")) {
    throw new ApiError(502, "Gemini failed and GROQ_API_KEY is not configured", previousErrors);
  }

  try {
    const response = await requestGroq({ prompt, systemPrompt });
    const message = response.data?.choices?.[0]?.message;
    const text = message?.content || message?.reasoning;

    console.log(`Groq fallback response time: ${Date.now() - startedAt}ms`);
    console.log(`Groq model used: ${response.data?.model || GROQ_MODEL}`);
    if (response.data?.usage) {
      console.log(`Groq token usage: ${JSON.stringify(response.data.usage)}`);
    }

    return {
      reply: formatAIReply(text),
      usage: response.data?.usage || null,
      responseTimeMs: Date.now() - startedAt,
      provider: "groq",
      model: response.data?.model || GROQ_MODEL,
    };
  } catch (error) {
    const status = error.response?.status;
    const groqMessage = error.response?.data?.error?.message || error.message;
    console.error(`Groq fallback failed: status=${status || "unknown"} model=${GROQ_MODEL} message=${groqMessage}`);

    if (error.code === "ECONNABORTED") {
      throw new ApiError(504, "Gemini failed and Groq fallback timed out", [
        ...previousErrors,
        getProviderErrorDetails("groq", error),
      ]);
    }

    if (status === 401 || status === 403) {
      throw new ApiError(502, "Gemini failed and Groq API key is invalid or not authorized", [
        ...previousErrors,
        getProviderErrorDetails("groq", error),
      ]);
    }

    if (status === 429) {
      throw new ApiError(429, "Both Gemini and Groq quotas are temporarily exhausted", [
        ...previousErrors,
        getProviderErrorDetails("groq", error),
      ]);
    }

    throw new ApiError(502, "Gemini failed and Groq fallback failed", [
      ...previousErrors,
      getProviderErrorDetails("groq", error),
    ]);
  }
};

export const generateGeminiReply = async ({ prompt, systemPrompt = SYSTEM_PROMPT }) => {
  const startedAt = Date.now();
  let lastError;

  try {
    const geminiApiKey = getEnv("GEMINI_API_KEY", "GOOGLE_GEMINI_API_KEY", "GOOGLE_API_KEY");

    if (!geminiApiKey) {
      return generateGroqReply({ prompt, systemPrompt, startedAt });
    }

    let response;
    let activeModel;

    for (const model of buildModelList()) {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          response = await requestGemini({ prompt, systemPrompt, model, apiKey: geminiApiKey });
          activeModel = model;
          break;
        } catch (error) {
          lastError = error;
          const status = error.response?.status;

          if (error.code === "ECONNABORTED" || RETRYABLE_STATUS_CODES.has(status)) {
            if (attempt < 2) {
              await sleep(getRetryDelayMs(error, attempt));
              continue;
            }
          }

          break;
        }
      }

      if (response) break;
    }

    if (!response) {
      throw lastError;
    }

    const text = response.data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n");

    console.log(`Gemini response time: ${Date.now() - startedAt}ms`);
    console.log(`Gemini model used: ${activeModel}`);
    if (response.data?.usageMetadata) {
      console.log(`Gemini token usage: ${JSON.stringify(response.data.usageMetadata)}`);
    }

    return {
      reply: formatAIReply(text),
      usage: response.data?.usageMetadata || null,
      responseTimeMs: Date.now() - startedAt,
      provider: "gemini",
      model: activeModel,
    };
  } catch (error) {
    const status = error.response?.status;

    if (error.code === "ECONNABORTED") {
      console.warn("Gemini timed out. Trying Groq fallback.");
      return generateGroqReply({
        prompt,
        systemPrompt,
        startedAt,
        previousErrors: [getProviderErrorDetails("gemini", error)],
      });
    }

    if (status === 429) {
      console.warn("Gemini quota exhausted. Trying Groq fallback.");
      return generateGroqReply({
        prompt,
        systemPrompt,
        startedAt,
        previousErrors: [getProviderErrorDetails("gemini", error)],
      });
    }

    const geminiMessage = error.response?.data?.error?.message;
    console.error(
      `Gemini API failed: status=${status || "unknown"} model=${GEMINI_MODEL} message=${geminiMessage || error.message}`,
    );

    if (status === 400 || status === 404) {
      console.warn(`Gemini model "${GEMINI_MODEL}" unavailable. Trying Groq fallback.`);
      return generateGroqReply({
        prompt,
        systemPrompt,
        startedAt,
        previousErrors: [getProviderErrorDetails("gemini", error)],
      });
    }

    if (status === 401 || status === 403) {
      console.warn("Gemini API key invalid or unauthorized. Trying Groq fallback.");
      return generateGroqReply({
        prompt,
        systemPrompt,
        startedAt,
        previousErrors: [getProviderErrorDetails("gemini", error)],
      });
    }

    return generateGroqReply({
      prompt,
      systemPrompt,
      startedAt,
      previousErrors: [getProviderErrorDetails("gemini", error)],
    });
  }
};

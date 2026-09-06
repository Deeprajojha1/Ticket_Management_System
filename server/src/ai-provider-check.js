import "dotenv/config";
import { generateGeminiReply } from "./services/gemini.service.js";

try {
  const result = await generateGeminiReply({
    prompt: "Reply with exactly: AI provider check passed",
  });

  console.log("AI provider check passed");
  console.log(JSON.stringify({
    provider: result.provider,
    model: result.model,
    responseTimeMs: result.responseTimeMs,
    reply: result.reply,
  }, null, 2));
} catch (error) {
  console.error("AI provider check failed");
  console.error(JSON.stringify({
    message: error.message,
    statusCode: error.statusCode,
    errors: error.errors,
  }, null, 2));
  process.exit(1);
}

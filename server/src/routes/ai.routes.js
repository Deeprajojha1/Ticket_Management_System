import { Router } from "express";
import {
  chatController,
  conversationController,
  deleteConversationController,
  historyController,
  textToSpeechController,
  transcribeController,
} from "../controllers/ai.controller.js";
import aiRateLimit from "../middlewares/aiRateLimit.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { handleAIAudioUpload, handleAIChatUpload } from "../middlewares/aiUpload.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { USER_ROLES } from "../utils/constants.js";
import {
  chatValidator,
  conversationIdValidator,
  historyQueryValidator,
  textToSpeechValidator,
  transcribeValidator,
} from "../validators/ai.validator.js";

const router = Router();

router.use(authenticateUser, authorizeRoles(USER_ROLES.CUSTOMER), aiRateLimit);

router.post("/chat", handleAIChatUpload, chatValidator, validate, chatController);
router.post("/transcribe", handleAIAudioUpload, transcribeValidator, validate, transcribeController);
router.post("/text-to-speech", textToSpeechValidator, validate, textToSpeechController);
router.get("/history", historyQueryValidator, validate, historyController);
router
  .route("/history/:conversationId")
  .get(conversationIdValidator, validate, conversationController)
  .delete(conversationIdValidator, validate, deleteConversationController);

export default router;

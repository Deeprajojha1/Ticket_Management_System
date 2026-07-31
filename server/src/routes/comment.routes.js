import { Router } from "express";
import {
  createCommentController,
  downloadCommentAttachmentController,
  getTicketCommentsController,
  openCommentAttachmentController,
} from "../controllers/comment.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { handleUpload } from "../middlewares/upload.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  commentAttachmentParamValidator,
  commentQueryValidator,
  createCommentValidator,
} from "../validators/comment.validator.js";

const router = Router({ mergeParams: true });

router.use(authenticateUser);

router
  .route("/:id/comments/:commentId/attachments/:index/open")
  .get(commentAttachmentParamValidator, validate, openCommentAttachmentController);

router
  .route("/:id/comments/:commentId/attachments/:index/download")
  .get(commentAttachmentParamValidator, validate, downloadCommentAttachmentController);

router
  .route("/:id/comments")
  .post(handleUpload, createCommentValidator, validate, createCommentController)
  .get(commentQueryValidator, validate, getTicketCommentsController);

export default router;

import { Router } from "express";
import {
  createCommentController,
  getTicketCommentsController,
} from "../controllers/comment.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { handleUpload } from "../middlewares/upload.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  commentQueryValidator,
  createCommentValidator,
} from "../validators/comment.validator.js";

const router = Router({ mergeParams: true });

router.use(authenticateUser);

router
  .route("/:id/comments")
  .post(handleUpload, createCommentValidator, validate, createCommentController)
  .get(commentQueryValidator, validate, getTicketCommentsController);

export default router;

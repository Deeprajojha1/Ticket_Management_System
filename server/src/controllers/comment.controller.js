import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createComment,
  getCommentAttachmentStream,
  getTicketComments,
} from "../services/comment.service.js";

const safeFilename = (filename = "attachment") =>
  filename
    .replace(/[^\w.\-() ]/g, "_")
    .replace(/\s+/g, " ")
    .trim() || "attachment";

export const createCommentController = asyncHandler(async (req, res) => {
  const comment = await createComment({
    ticketId: req.params.id,
    payload: req.body,
    files: req.files,
    user: req.user,
  });

  res.status(201).json(new ApiResponse(201, { comment }, "Comment added successfully"));
});

export const getTicketCommentsController = asyncHandler(async (req, res) => {
  const result = await getTicketComments({
    ticketId: req.params.id,
    queryString: req.query,
    user: req.user,
  });

  res.status(200).json(new ApiResponse(200, result, "Comments fetched successfully"));
});

export const openCommentAttachmentController = asyncHandler(async (req, res) => {
  const { stream, attachment, contentType, contentLength } = await getCommentAttachmentStream({
    ticketId: req.params.id,
    commentId: req.params.commentId,
    attachmentIndex: req.params.index,
    user: req.user,
  });

  if (contentLength) {
    res.setHeader("Content-Length", contentLength);
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `inline; filename="${safeFilename(attachment.originalName)}"`);
  stream.pipe(res);
});

export const downloadCommentAttachmentController = asyncHandler(async (req, res) => {
  const { stream, attachment, contentType, contentLength } = await getCommentAttachmentStream({
    ticketId: req.params.id,
    commentId: req.params.commentId,
    attachmentIndex: req.params.index,
    user: req.user,
  });

  if (contentLength) {
    res.setHeader("Content-Length", contentLength);
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${safeFilename(attachment.originalName)}"`);
  stream.pipe(res);
});

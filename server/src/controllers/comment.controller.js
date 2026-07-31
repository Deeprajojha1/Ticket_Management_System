import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  createComment,
  getTicketComments,
} from "../services/comment.service.js";

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

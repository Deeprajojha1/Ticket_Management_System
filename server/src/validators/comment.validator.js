import { body, param, query } from "express-validator";

export const commentTicketParamValidator = [
  param("id").isMongoId().withMessage("Invalid ticket id"),
];

export const createCommentValidator = [
  ...commentTicketParamValidator,
  body("message")
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Message must be between 1 and 2000 characters"),
];

export const commentQueryValidator = [
  ...commentTicketParamValidator,
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];

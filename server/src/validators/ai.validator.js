import { body, param, query } from "express-validator";

export const chatValidator = [
  body("message")
    .trim()
    .isLength({ min: 2, max: 2000 })
    .withMessage("Message must be between 2 and 2000 characters"),
  body("conversationId")
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage("conversationId must be a valid Mongo id"),
];

export const transcribeValidator = [
  body("conversationId")
    .optional({ checkFalsy: true })
    .isMongoId()
    .withMessage("conversationId must be a valid Mongo id"),
];

export const textToSpeechValidator = [
  body("text")
    .trim()
    .isLength({ min: 2, max: 2000 })
    .withMessage("Text must be between 2 and 2000 characters"),
];

export const historyQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];

export const conversationIdValidator = [
  param("conversationId").isMongoId().withMessage("Invalid conversation id"),
];

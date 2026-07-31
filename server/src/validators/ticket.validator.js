import { body, param, query } from "express-validator";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../utils/constants.js";

export const mongoIdParamValidator = [
  param("id").isMongoId().withMessage("Invalid ticket id"),
];

export const attachmentParamValidator = [
  ...mongoIdParamValidator,
  param("index").isInt({ min: 0 }).withMessage("Invalid attachment index"),
];

export const createTicketValidator = [
  body("title")
    .trim()
    .isLength({ min: 10, max: 120 })
    .withMessage("Title must be between 10 and 120 characters"),
  body("description")
    .trim()
    .isLength({ min: 20, max: 3000 })
    .withMessage("Description must be between 20 and 3000 characters"),
  body("category")
    .isIn(Object.values(TICKET_CATEGORIES))
    .withMessage("Category is invalid"),
  body("priority")
    .isIn(Object.values(TICKET_PRIORITIES))
    .withMessage("Priority is invalid"),
  body("tags")
    .optional()
    .customSanitizer((value) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === "string") {
        return value.split(",").map((tag) => tag.trim()).filter(Boolean);
      }

      return [];
    })
    .isArray()
    .withMessage("Tags must be an array or comma-separated string"),
  body("tags.*").optional().trim().isLength({ max: 40 }).withMessage("Each tag must be at most 40 characters"),
];

export const updateTicketValidator = [
  ...mongoIdParamValidator,
  body("title")
    .optional()
    .trim()
    .isLength({ min: 10, max: 120 })
    .withMessage("Title must be between 10 and 120 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ min: 20, max: 3000 })
    .withMessage("Description must be between 20 and 3000 characters"),
  body("category")
    .optional()
    .isIn(Object.values(TICKET_CATEGORIES))
    .withMessage("Category is invalid"),
  body("priority")
    .optional()
    .isIn(Object.values(TICKET_PRIORITIES))
    .withMessage("Priority is invalid"),
  body("tags")
    .optional()
    .customSanitizer((value) => {
      if (Array.isArray(value)) {
        return value;
      }

      if (typeof value === "string") {
        return value.split(",").map((tag) => tag.trim()).filter(Boolean);
      }

      return [];
    })
    .isArray()
    .withMessage("Tags must be an array or comma-separated string"),
];

export const ticketQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("status").optional().isIn(Object.values(TICKET_STATUSES)).withMessage("Status is invalid"),
  query("priority").optional().isIn(Object.values(TICKET_PRIORITIES)).withMessage("Priority is invalid"),
  query("category").optional().isIn(Object.values(TICKET_CATEGORIES)).withMessage("Category is invalid"),
  query("assignedAgent").optional().isMongoId().withMessage("assignedAgent must be a valid user id"),
  query("createdBy").optional().isMongoId().withMessage("createdBy must be a valid user id"),
  query("sort").optional().isIn(["newest", "oldest", "priority", "status", "lastActivity"]).withMessage("Sort is invalid"),
  query("search").optional().trim().isLength({ max: 120 }).withMessage("Search cannot exceed 120 characters"),
];

export const updateStatusValidator = [
  ...mongoIdParamValidator,
  body("status")
    .isIn(Object.values(TICKET_STATUSES))
    .withMessage("Status is invalid"),
];

export const updatePriorityValidator = [
  ...mongoIdParamValidator,
  body("priority")
    .isIn(Object.values(TICKET_PRIORITIES))
    .withMessage("Priority is invalid"),
];

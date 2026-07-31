import { query } from "express-validator";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../utils/constants.js";

const dateQuery = (field) =>
  query(field)
    .optional()
    .isISO8601()
    .withMessage(`${field} must be a valid ISO date`);

export const dashboardListValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("search").optional().trim().isLength({ max: 120 }).withMessage("Search cannot exceed 120 characters"),
  query("status").optional().isIn(Object.values(TICKET_STATUSES)).withMessage("Status is invalid"),
  query("priority").optional().isIn(Object.values(TICKET_PRIORITIES)).withMessage("Priority is invalid"),
  query("category").optional().isIn(Object.values(TICKET_CATEGORIES)).withMessage("Category is invalid"),
  query("assignedAgent").optional().isMongoId().withMessage("assignedAgent must be a valid user id"),
  query("createdBy").optional().isMongoId().withMessage("createdBy must be a valid user id"),
  query("createdToday").optional().isBoolean().withMessage("createdToday must be true or false"),
  query("createdThisWeek").optional().isBoolean().withMessage("createdThisWeek must be true or false"),
  query("createdThisMonth").optional().isBoolean().withMessage("createdThisMonth must be true or false"),
  query("resolvedToday").optional().isBoolean().withMessage("resolvedToday must be true or false"),
  query("resolvedThisWeek").optional().isBoolean().withMessage("resolvedThisWeek must be true or false"),
  query("sort")
    .optional()
    .isIn(["newest", "oldest", "priority", "status", "lastActivity", "createdDate", "updatedDate"])
    .withMessage("Sort is invalid"),
  dateQuery("startDate"),
  dateQuery("endDate"),
];

export const activityQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];

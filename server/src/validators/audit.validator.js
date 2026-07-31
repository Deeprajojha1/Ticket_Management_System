import { query } from "express-validator";

export const auditQueryValidator = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
  query("action").optional().trim().isLength({ max: 80 }).withMessage("Action cannot exceed 80 characters"),
  query("entityType").optional().trim().isLength({ max: 80 }).withMessage("Entity type cannot exceed 80 characters"),
  query("entityId").optional().isMongoId().withMessage("entityId must be a valid Mongo id"),
  query("ticket").optional().isMongoId().withMessage("ticket must be a valid Mongo id"),
  query("actor").optional().isMongoId().withMessage("actor must be a valid Mongo id"),
];

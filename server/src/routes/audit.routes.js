import { Router } from "express";
import { getAuditLogsController } from "../controllers/audit.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { USER_ROLES } from "../utils/constants.js";
import { auditQueryValidator } from "../validators/audit.validator.js";

const router = Router();

/**
 * @openapi
 * /api/v1/audit-logs:
 *   get:
 *     summary: Get audit logs
 *     tags: [Audit]
 */
router.get("/", authenticateUser, authorizeRoles(USER_ROLES.AGENT), auditQueryValidator, validate, getAuditLogsController);

export default router;

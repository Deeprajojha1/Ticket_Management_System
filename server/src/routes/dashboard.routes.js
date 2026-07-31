import { Router } from "express";
import {
  activityController,
  categoryChartController,
  monthlyChartController,
  myTicketsController,
  overviewController,
  priorityChartController,
  statusChartController,
  ticketSearchController,
} from "../controllers/dashboard.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { USER_ROLES } from "../utils/constants.js";
import {
  activityQueryValidator,
  dashboardListValidator,
} from "../validators/dashboard.validator.js";

const router = Router();

router.use(authenticateUser, authorizeRoles(USER_ROLES.AGENT));

router.get("/overview", overviewController);
router.get("/charts/status", statusChartController);
router.get("/charts/priority", priorityChartController);
router.get("/charts/category", categoryChartController);
router.get("/charts/monthly", monthlyChartController);
router.get("/tickets", dashboardListValidator, validate, ticketSearchController);
router.get("/activity", activityQueryValidator, validate, activityController);
router.get("/my-tickets", dashboardListValidator, validate, myTicketsController);

export default router;

import { Router } from "express";
import {
  assignTicketController,
  createTicketController,
  deleteTicketController,
  downloadTicketAttachmentController,
  getAgentTicketsController,
  getAssignableAgentsController,
  getMyTicketsController,
  getTicketByIdController,
  openTicketAttachmentController,
  updateTicketController,
  updateTicketPriorityController,
  updateTicketStatusController,
} from "../controllers/ticket.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import { handleUpload } from "../middlewares/upload.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { USER_ROLES } from "../utils/constants.js";
import {
  createTicketValidator,
  attachmentParamValidator,
  mongoIdParamValidator,
  ticketQueryValidator,
  updatePriorityValidator,
  updateStatusValidator,
  updateTicketValidator,
} from "../validators/ticket.validator.js";
import commentRoutes from "./comment.routes.js";

const customerRouter = Router();
const agentRouter = Router();

customerRouter.use(authenticateUser);
customerRouter.use(commentRoutes);

customerRouter
  .route("/")
  .post(authorizeRoles(USER_ROLES.CUSTOMER), handleUpload, createTicketValidator, validate, createTicketController);

customerRouter
  .route("/my")
  .get(ticketQueryValidator, validate, getMyTicketsController);

customerRouter
  .route("/:id/attachments/:index/open")
  .get(attachmentParamValidator, validate, openTicketAttachmentController);

customerRouter
  .route("/:id/attachments/:index/download")
  .get(attachmentParamValidator, validate, downloadTicketAttachmentController);

customerRouter
  .route("/:id")
  .get(mongoIdParamValidator, validate, getTicketByIdController)
  .patch(authorizeRoles(USER_ROLES.CUSTOMER), handleUpload, updateTicketValidator, validate, updateTicketController)
  .delete(authorizeRoles(USER_ROLES.CUSTOMER), mongoIdParamValidator, validate, deleteTicketController);

agentRouter.use(authenticateUser, authorizeRoles(USER_ROLES.AGENT));

agentRouter
  .route("/tickets")
  .get(ticketQueryValidator, validate, getAgentTicketsController);

agentRouter
  .route("/agents")
  .get(getAssignableAgentsController);

agentRouter
  .route("/tickets/:id/status")
  .patch(updateStatusValidator, validate, updateTicketStatusController);

agentRouter
  .route("/tickets/:id/priority")
  .patch(updatePriorityValidator, validate, updateTicketPriorityController);

agentRouter
  .route("/tickets/:id/assign")
  .patch(mongoIdParamValidator, validate, assignTicketController);

export { agentRouter };
export default customerRouter;

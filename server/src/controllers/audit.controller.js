import { getAuditLogs } from "../services/audit.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const getAuditLogsController = asyncHandler(async (req, res) => {
  const result = await getAuditLogs(req.query);

  res.status(200).json(new ApiResponse(200, result, "Audit logs fetched successfully"));
});

import AuditLog from "../models/AuditLog.model.js";
import APIFeatures from "../utils/APIFeatures.js";

export const createAuditLog = async ({
  actor = null,
  action,
  entityType,
  entityId = null,
  ticket = null,
  before = null,
  after = null,
  metadata = {},
}) => {
  try {
    return await AuditLog.create({
      actor,
      action,
      entityType,
      entityId,
      ticket,
      before,
      after,
      metadata,
    });
  } catch (error) {
    console.error(`Audit log failed: ${error.message}`);
    return null;
  }
};

export const getAuditLogs = async (queryString) => {
  const baseQuery = AuditLog.find()
    .populate("actor", "fullName email role avatar")
    .populate("ticket", "ticketNumber title status priority");

  const features = new APIFeatures(baseQuery, queryString)
    .filter(["action", "entityType", "entityId", "ticket", "actor"])
    .sort();

  const totalDocuments = await AuditLog.countDocuments(features.query.getFilter());
  features.paginate(totalDocuments);
  const auditLogs = await features.query.lean();

  return { auditLogs, pagination: features.pagination };
};

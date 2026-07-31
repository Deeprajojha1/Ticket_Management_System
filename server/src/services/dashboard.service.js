import mongoose from "mongoose";
import Comment from "../models/Comment.model.js";
import Ticket from "../models/Ticket.model.js";
import {
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
} from "../utils/constants.js";

const objectId = (value) => new mongoose.Types.ObjectId(value);

const startOfDay = (date = new Date()) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const startOfWeek = (date = new Date()) => {
  const nextDate = startOfDay(date);
  const day = nextDate.getDay();
  const offset = day === 0 ? 6 : day - 1;
  nextDate.setDate(nextDate.getDate() - offset);
  return nextDate;
};

const startOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);

const endOfDay = (date = new Date()) => {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
};

const resolvedActivityMatch = (fromDate, toDate) => ({
  activityLog: {
    $elemMatch: {
      action: "Status Changed",
      to: TICKET_STATUSES.RESOLVED,
      createdAt: { $gte: fromDate, ...(toDate ? { $lte: toDate } : {}) },
    },
  },
});

const buildMatchFilters = (query = {}, currentAgentId = null) => {
  const match = { isDeleted: false };

  ["status", "priority", "category"].forEach((field) => {
    if (query[field]) {
      match[field] = query[field];
    }
  });

  if (query.assignedAgent) {
    match.assignedAgent = objectId(query.assignedAgent);
  }

  if (query.createdBy) {
    match.createdBy = objectId(query.createdBy);
  }

  if (currentAgentId) {
    match.assignedAgent = objectId(currentAgentId);
  }

  if (query.startDate || query.endDate) {
    match.createdAt = {};
    if (query.startDate) {
      match.createdAt.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      match.createdAt.$lte = endOfDay(new Date(query.endDate));
    }
  }

  if (query.createdToday === "true") {
    match.createdAt = { $gte: startOfDay(), $lte: endOfDay() };
  }

  if (query.createdThisWeek === "true") {
    match.createdAt = { $gte: startOfWeek() };
  }

  if (query.createdThisMonth === "true") {
    match.createdAt = { $gte: startOfMonth(new Date()) };
  }

  if (query.resolvedToday === "true") {
    Object.assign(match, resolvedActivityMatch(startOfDay(), endOfDay()));
  }

  if (query.resolvedThisWeek === "true") {
    Object.assign(match, resolvedActivityMatch(startOfWeek()));
  }

  return match;
};

const buildSearchStages = (search) => {
  const stages = [
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    { $unwind: "$createdBy" },
    {
      $lookup: {
        from: "users",
        localField: "assignedAgent",
        foreignField: "_id",
        as: "assignedAgent",
      },
    },
    { $unwind: { path: "$assignedAgent", preserveNullAndEmptyArrays: true } },
  ];

  if (search) {
    const regex = new RegExp(search.trim(), "i");
    stages.push({
      $match: {
        $or: [
          { ticketNumber: regex },
          { title: regex },
          { description: regex },
          { "createdBy.fullName": regex },
          { "createdBy.email": regex },
        ],
      },
    });
  }

  return stages;
};

const projectTicket = {
  ticketNumber: 1,
  title: 1,
  description: 1,
  category: 1,
  priority: 1,
  status: 1,
  attachments: 1,
  tags: 1,
  lastActivity: 1,
  activityLog: 1,
  createdAt: 1,
  updatedAt: 1,
  createdBy: {
    _id: "$createdBy._id",
    fullName: "$createdBy.fullName",
    email: "$createdBy.email",
    role: "$createdBy.role",
    avatar: "$createdBy.avatar",
  },
  assignedAgent: {
    _id: "$assignedAgent._id",
    fullName: "$assignedAgent.fullName",
    email: "$assignedAgent.email",
    role: "$assignedAgent.role",
    avatar: "$assignedAgent.avatar",
  },
};

const paginationFacet = (page, limit) => [
  {
    $facet: {
      documents: [{ $skip: (page - 1) * limit }, { $limit: limit }],
      metadata: [{ $count: "totalDocuments" }],
    },
  },
  {
    $project: {
      documents: 1,
      totalDocuments: { $ifNull: [{ $arrayElemAt: ["$metadata.totalDocuments", 0] }, 0] },
    },
  },
];

const toPaginatedResult = (result, page, limit, key) => {
  const payload = result[0] || { documents: [], totalDocuments: 0 };
  const totalPages = Math.ceil(payload.totalDocuments / limit) || 1;

  return {
    [key]: payload.documents,
    pagination: {
      totalDocuments: payload.totalDocuments,
      totalPages,
      currentPage: page,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      limit,
    },
  };
};

const sortStage = (sort) => {
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    priority: { priorityWeight: -1, lastActivity: -1 },
    status: { status: 1, lastActivity: -1 },
    lastActivity: { lastActivity: -1 },
    createdDate: { createdAt: -1 },
    updatedDate: { updatedAt: -1 },
  };

  return sortMap[sort] || sortMap.lastActivity;
};

export const getDashboardOverview = async (agentId) => {
  const todayStart = startOfDay();
  const todayEnd = endOfDay();
  const agentObjectId = objectId(agentId);

  const [kpi] = await Ticket.aggregate([
    { $match: { isDeleted: false } },
    {
      $facet: {
        counts: [
          {
            $group: {
              _id: null,
              totalTickets: { $sum: 1 },
              openTickets: { $sum: { $cond: [{ $eq: ["$status", TICKET_STATUSES.OPEN] }, 1, 0] } },
              inProgressTickets: { $sum: { $cond: [{ $eq: ["$status", TICKET_STATUSES.IN_PROGRESS] }, 1, 0] } },
              resolvedTickets: { $sum: { $cond: [{ $eq: ["$status", TICKET_STATUSES.RESOLVED] }, 1, 0] } },
              closedTickets: { $sum: { $cond: [{ $eq: ["$status", TICKET_STATUSES.CLOSED] }, 1, 0] } },
              highPriorityTickets: { $sum: { $cond: [{ $eq: ["$priority", TICKET_PRIORITIES.HIGH] }, 1, 0] } },
              urgentTickets: { $sum: { $cond: [{ $eq: ["$priority", TICKET_PRIORITIES.URGENT] }, 1, 0] } },
              ticketsCreatedToday: {
                $sum: {
                  $cond: [{ $and: [{ $gte: ["$createdAt", todayStart] }, { $lte: ["$createdAt", todayEnd] }] }, 1, 0],
                },
              },
              myAssignedTickets: { $sum: { $cond: [{ $eq: ["$assignedAgent", agentObjectId] }, 1, 0] } },
              myPendingTickets: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ["$assignedAgent", agentObjectId] },
                        { $in: ["$status", [TICKET_STATUSES.OPEN, TICKET_STATUSES.IN_PROGRESS]] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
        ],
        resolvedToday: [
          { $match: resolvedActivityMatch(todayStart, todayEnd) },
          { $count: "ticketsResolvedToday" },
        ],
        resolutionTime: [
          { $unwind: "$activityLog" },
          { $match: { "activityLog.action": "Status Changed", "activityLog.to": TICKET_STATUSES.RESOLVED } },
          {
            $group: {
              _id: "$_id",
              createdAt: { $first: "$createdAt" },
              resolvedAt: { $min: "$activityLog.createdAt" },
            },
          },
          {
            $group: {
              _id: null,
              averageResolutionTimeMs: { $avg: { $subtract: ["$resolvedAt", "$createdAt"] } },
            },
          },
        ],
        latestTicket: [{ $sort: { createdAt: -1 } }, { $limit: 1 }],
      },
    },
  ]);

  const latestComment = await Comment.findOne()
    .sort({ createdAt: -1 })
    .populate("user", "fullName email role avatar")
    .populate("ticket", "ticketNumber title status")
    .lean();

  const counts = kpi?.counts?.[0] || {};
  return {
    totalTickets: counts.totalTickets || 0,
    openTickets: counts.openTickets || 0,
    inProgressTickets: counts.inProgressTickets || 0,
    resolvedTickets: counts.resolvedTickets || 0,
    closedTickets: counts.closedTickets || 0,
    highPriorityTickets: counts.highPriorityTickets || 0,
    urgentTickets: counts.urgentTickets || 0,
    ticketsCreatedToday: counts.ticketsCreatedToday || 0,
    ticketsResolvedToday: kpi?.resolvedToday?.[0]?.ticketsResolvedToday || 0,
    averageResolutionTimeMs: Math.round(kpi?.resolutionTime?.[0]?.averageResolutionTimeMs || 0),
    myAssignedTickets: counts.myAssignedTickets || 0,
    myPendingTickets: counts.myPendingTickets || 0,
    latestTicket: kpi?.latestTicket?.[0] || null,
    latestComment,
  };
};

export const getStatusChart = async () => {
  const data = await Ticket.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  return Object.values(TICKET_STATUSES).map((status) => ({
    status,
    count: data.find((item) => item._id === status)?.count || 0,
  }));
};

export const getPriorityChart = async () => {
  const data = await Ticket.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$priority", count: { $sum: 1 } } },
  ]);

  return Object.values(TICKET_PRIORITIES).map((priority) => ({
    priority,
    count: data.find((item) => item._id === priority)?.count || 0,
  }));
};

export const getCategoryChart = async () => {
  const data = await Ticket.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  return Object.values(TICKET_CATEGORIES).map((category) => ({
    category,
    count: data.find((item) => item._id === category)?.count || 0,
  }));
};

export const getMonthlyChart = async () => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 11, 1);

  return Ticket.aggregate([
    { $match: { isDeleted: false, createdAt: { $gte: from } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
    {
      $project: {
        _id: 0,
        year: "$_id.year",
        month: "$_id.month",
        count: 1,
      },
    },
  ]);
};

export const searchDashboardTickets = async ({ queryString, currentAgentId = null }) => {
  const page = Math.max(Number.parseInt(queryString.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(queryString.limit, 10) || 10, 1), 100);
  const match = buildMatchFilters(queryString, currentAgentId);

  const result = await Ticket.aggregate([
    { $match: match },
    ...buildSearchStages(queryString.search),
    { $sort: sortStage(queryString.sort) },
    { $project: projectTicket },
    ...paginationFacet(page, limit),
  ]);

  return toPaginatedResult(result, page, limit, "tickets");
};

export const getRecentActivities = async (queryString = {}) => {
  const page = Math.max(Number.parseInt(queryString.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(queryString.limit, 10) || 10, 1), 100);

  const result = await Ticket.aggregate([
    { $match: { isDeleted: false } },
    { $unwind: "$activityLog" },
    {
      $match: {
        "activityLog.action": {
          $in: ["Ticket Created", "Comment Added", "Priority Changed", "Status Changed", "Assigned to Agent", "Ticket Deleted"],
        },
      },
    },
    { $sort: { "activityLog.createdAt": -1 } },
    {
      $lookup: {
        from: "users",
        localField: "activityLog.actor",
        foreignField: "_id",
        as: "actor",
      },
    },
    { $unwind: "$actor" },
    {
      $project: {
        _id: 0,
        ticket: {
          _id: "$_id",
          ticketNumber: "$ticketNumber",
          title: "$title",
          status: "$status",
          priority: "$priority",
        },
        action: "$activityLog.action",
        from: "$activityLog.from",
        to: "$activityLog.to",
        metadata: "$activityLog.metadata",
        createdAt: "$activityLog.createdAt",
        actor: {
          _id: "$actor._id",
          fullName: "$actor.fullName",
          email: "$actor.email",
          role: "$actor.role",
          avatar: "$actor.avatar",
        },
      },
    },
    ...paginationFacet(page, limit),
  ]);

  return toPaginatedResult(result, page, limit, "activities");
};

export const getMyAssignedTickets = async ({ queryString, agentId }) =>
  searchDashboardTickets({ queryString, currentAgentId: agentId });

import {
  getCategoryChart,
  getDashboardOverview,
  getMonthlyChart,
  getMyAssignedTickets,
  getPriorityChart,
  getRecentActivities,
  getStatusChart,
  searchDashboardTickets,
} from "../services/dashboard.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const overviewController = asyncHandler(async (req, res) => {
  const overview = await getDashboardOverview(req.user._id);

  res.status(200).json(new ApiResponse(200, { overview }, "Dashboard overview fetched successfully"));
});

export const statusChartController = asyncHandler(async (_req, res) => {
  const status = await getStatusChart();

  res.status(200).json(new ApiResponse(200, { status }, "Status chart fetched successfully"));
});

export const priorityChartController = asyncHandler(async (_req, res) => {
  const priority = await getPriorityChart();

  res.status(200).json(new ApiResponse(200, { priority }, "Priority chart fetched successfully"));
});

export const categoryChartController = asyncHandler(async (_req, res) => {
  const category = await getCategoryChart();

  res.status(200).json(new ApiResponse(200, { category }, "Category chart fetched successfully"));
});

export const monthlyChartController = asyncHandler(async (_req, res) => {
  const monthly = await getMonthlyChart();

  res.status(200).json(new ApiResponse(200, { monthly }, "Monthly chart fetched successfully"));
});

export const ticketSearchController = asyncHandler(async (req, res) => {
  const result = await searchDashboardTickets({ queryString: req.query });

  res.status(200).json(new ApiResponse(200, result, "Dashboard tickets fetched successfully"));
});

export const activityController = asyncHandler(async (req, res) => {
  const result = await getRecentActivities(req.query);

  res.status(200).json(new ApiResponse(200, result, "Recent activities fetched successfully"));
});

export const myTicketsController = asyncHandler(async (req, res) => {
  const result = await getMyAssignedTickets({ queryString: req.query, agentId: req.user._id });

  res.status(200).json(new ApiResponse(200, result, "Assigned tickets fetched successfully"));
});

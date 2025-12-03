const requestService = require('./request.service');
const asyncHandler = require('../../shared/utils/asyncHandler');
const ApiResponse = require('../../shared/utils/ApiResponse');

/**
 * Create a new request
 */
const createRequest = asyncHandler(async (req, res) => {
  const request = await requestService.createRequest(req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, 'Request created successfully', request));
});

/**
 * Get all requests
 */
const getAllRequests = asyncHandler(async (req, res) => {
  const result = await requestService.getAllRequests(req.query);
  res.json(new ApiResponse(200, 'Requests retrieved successfully', result.requests, result.pagination));
});

/**
 * Get request by ID
 */
const getRequestById = asyncHandler(async (req, res) => {
  const request = await requestService.getRequestById(req.params.id);
  res.json(new ApiResponse(200, 'Request retrieved successfully', request));
});

/**
 * Get requests by course
 */
const getRequestsByCourse = asyncHandler(async (req, res) => {
  const result = await requestService.getRequestsByCourse(req.params.courseId, req.query);
  res.json(new ApiResponse(200, 'Course requests retrieved successfully', result.requests, result.pagination));
});

/**
 * Get user's requests
 */
const getUserRequests = asyncHandler(async (req, res) => {
  const result = await requestService.getUserRequests(req.user._id, req.query);
  res.json(new ApiResponse(200, 'User requests retrieved successfully', result.requests, result.pagination));
});

/**
 * Update request
 */
const updateRequest = asyncHandler(async (req, res) => {
  const request = await requestService.updateRequest(req.params.id, req.body, req.user._id);
  res.json(new ApiResponse(200, 'Request updated successfully', request));
});

/**
 * Delete request
 */
const deleteRequest = asyncHandler(async (req, res) => {
  const result = await requestService.deleteRequest(req.params.id, req.user._id);
  res.json(new ApiResponse(200, result.message));
});

/**
 * Vote on request
 */
const voteOnRequest = asyncHandler(async (req, res) => {
  const { voteType } = req.body;
  const request = await requestService.voteOnRequest(req.params.id, voteType, req.user._id);
  res.json(new ApiResponse(200, 'Vote recorded successfully', request));
});

/**
 * Mark request as in progress
 */
const markInProgress = asyncHandler(async (req, res) => {
  const request = await requestService.markInProgress(req.params.id, req.user._id);
  res.json(new ApiResponse(200, 'Request marked as in progress', request));
});

/**
 * Fulfill request
 */
const fulfillRequest = asyncHandler(async (req, res) => {
  const request = await requestService.fulfillRequest(req.params.id, req.body, req.user._id);
  res.json(new ApiResponse(200, 'Request fulfilled successfully', request));
});

/**
 * Reject request
 */
const rejectRequest = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const request = await requestService.rejectRequest(req.params.id, reason, req.user._id);
  res.json(new ApiResponse(200, 'Request rejected', request));
});

/**
 * Get request statistics
 */
const getRequestStats = asyncHandler(async (req, res) => {
  const stats = await requestService.getRequestStats(req.query.courseId);
  res.json(new ApiResponse(200, 'Request statistics retrieved successfully', stats));
});

module.exports = {
  createRequest,
  getAllRequests,
  getRequestById,
  getRequestsByCourse,
  getUserRequests,
  updateRequest,
  deleteRequest,
  voteOnRequest,
  markInProgress,
  fulfillRequest,
  rejectRequest,
  getRequestStats,
};

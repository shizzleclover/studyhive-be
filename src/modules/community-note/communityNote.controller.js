const communityNoteService = require('./communityNote.service');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const asyncHandler = require('../../shared/utils/asyncHandler');

const createCommunityNote = asyncHandler(async (req, res) => {
  const communityNote = await communityNoteService.createCommunityNote(req.body, req.user.id);
  const response = new ApiResponse(HTTP_STATUS.CREATED, { communityNote }, 'Community note created successfully');
  res.status(HTTP_STATUS.CREATED).json(response);
});

const getAllCommunityNotes = asyncHandler(async (req, res) => {
  const { page, limit, course, author, tags, search, sortBy } = req.query;
  const data = await communityNoteService.getAllCommunityNotes(parseInt(page), parseInt(limit), { course, author, tags, search, sortBy });
  const response = new ApiResponse(HTTP_STATUS.OK, data, 'Community notes retrieved successfully');
  res.status(response.statusCode).json(response);
});

const getCommunityNotesByCourse = asyncHandler(async (req, res) => {
  const { page, limit, tags, sortBy } = req.query;
  const data = await communityNoteService.getCommunityNotesByCourse(req.params.courseId, parseInt(page), parseInt(limit), { tags, sortBy });
  const response = new ApiResponse(HTTP_STATUS.OK, data, 'Community notes retrieved successfully');
  res.status(response.statusCode).json(response);
});

const getCommunityNoteById = asyncHandler(async (req, res) => {
  const communityNote = await communityNoteService.getCommunityNoteById(req.params.id, true);
  const response = new ApiResponse(HTTP_STATUS.OK, { communityNote }, 'Community note retrieved successfully');
  res.status(response.statusCode).json(response);
});

const updateCommunityNote = asyncHandler(async (req, res) => {
  const communityNote = await communityNoteService.updateCommunityNote(req.params.id, req.body, req.user.id);
  const response = new ApiResponse(HTTP_STATUS.OK, { communityNote }, 'Community note updated successfully');
  res.status(response.statusCode).json(response);
});

const deleteCommunityNote = asyncHandler(async (req, res) => {
  const data = await communityNoteService.deleteCommunityNote(req.params.id, req.user.id, req.user.role);
  const response = new ApiResponse(HTTP_STATUS.OK, data, 'Community note deleted successfully');
  res.status(response.statusCode).json(response);
});

const togglePin = asyncHandler(async (req, res) => {
  const { isPinned } = req.body;
  const communityNote = await communityNoteService.togglePin(req.params.id, isPinned);
  const response = new ApiResponse(HTTP_STATUS.OK, { communityNote }, `Note ${isPinned ? 'pinned' : 'unpinned'} successfully`);
  res.status(response.statusCode).json(response);
});

const reportNote = asyncHandler(async (req, res) => {
  const data = await communityNoteService.reportNote(req.params.id);
  const response = new ApiResponse(HTTP_STATUS.OK, data, 'Note reported successfully');
  res.status(response.statusCode).json(response);
});

const getUserNotes = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await communityNoteService.getUserNotes(req.params.userId, parseInt(page), parseInt(limit));
  const response = new ApiResponse(HTTP_STATUS.OK, data, 'User notes retrieved successfully');
  res.status(response.statusCode).json(response);
});

const getMyNotes = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await communityNoteService.getUserNotes(req.user.id, parseInt(page) || 1, parseInt(limit) || 10);
  const response = new ApiResponse(HTTP_STATUS.OK, data, 'Your notes retrieved successfully');
  res.status(response.statusCode).json(response);
});

module.exports = {
  createCommunityNote,
  getAllCommunityNotes,
  getCommunityNotesByCourse,
  getCommunityNoteById,
  updateCommunityNote,
  deleteCommunityNote,
  togglePin,
  reportNote,
  getUserNotes,
  getMyNotes,
};

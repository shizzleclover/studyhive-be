const officialNoteService = require('./officialNote.service');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const asyncHandler = require('../../shared/utils/asyncHandler');

const createOfficialNote = asyncHandler(async (req, res) => {
  const officialNote = await officialNoteService.createOfficialNote(req.body, req.user.id);
  const response = new ApiResponse(HTTP_STATUS.CREATED, { officialNote }, 'Official note uploaded successfully');
  res.status(response.statusCode).json(response);
});

const getAllOfficialNotes = asyncHandler(async (req, res) => {
  const { page, limit, course, category, search } = req.query;
  const data = await officialNoteService.getAllOfficialNotes(parseInt(page), parseInt(limit), { course, category, search });
  const response = new ApiResponse(HTTP_STATUS.OK, data, 'Official notes retrieved successfully');
  res.status(response.statusCode).json(response);
});

const getOfficialNotesByCourse = asyncHandler(async (req, res) => {
  const { page, limit, category } = req.query;
  const data = await officialNoteService.getOfficialNotesByCourse(req.params.courseId, parseInt(page), parseInt(limit), { category });
  const response = new ApiResponse(HTTP_STATUS.OK, data, 'Official notes retrieved successfully');
  res.status(response.statusCode).json(response);
});

const getOfficialNoteById = asyncHandler(async (req, res) => {
  const officialNote = await officialNoteService.getOfficialNoteById(req.params.id);
  const response = new ApiResponse(HTTP_STATUS.OK, { officialNote }, 'Official note retrieved successfully');
  res.status(response.statusCode).json(response);
});

const getDownloadUrl = asyncHandler(async (req, res) => {
  const data = await officialNoteService.getDownloadUrl(req.params.id);
  const response = new ApiResponse(HTTP_STATUS.OK, data, 'Download URL generated successfully');
  res.status(response.statusCode).json(response);
});

const updateOfficialNote = asyncHandler(async (req, res) => {
  const officialNote = await officialNoteService.updateOfficialNote(req.params.id, req.body);
  const response = new ApiResponse(HTTP_STATUS.OK, { officialNote }, 'Official note updated successfully');
  res.status(response.statusCode).json(response);
});

const deleteOfficialNote = asyncHandler(async (req, res) => {
  const data = await officialNoteService.deleteOfficialNote(req.params.id);
  const response = new ApiResponse(HTTP_STATUS.OK, data, 'Official note deleted successfully');
  res.status(response.statusCode).json(response);
});

module.exports = {
  createOfficialNote,
  getAllOfficialNotes,
  getOfficialNotesByCourse,
  getOfficialNoteById,
  getDownloadUrl,
  updateOfficialNote,
  deleteOfficialNote,
};

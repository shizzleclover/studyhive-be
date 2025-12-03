const commentService = require('./comment.service');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const asyncHandler = require('../../shared/utils/asyncHandler');

const createComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const comment = await commentService.createComment(req.params.noteId, content, req.user.id);
  const response = new ApiResponse(HTTP_STATUS.CREATED, { comment }, 'Comment created successfully');
  res.status(response.statusCode).json(response);
});

const getCommentsByNote = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const data = await commentService.getCommentsByNote(req.params.noteId, parseInt(page), parseInt(limit));
  const response = new ApiResponse(HTTP_STATUS.OK, data, 'Comments retrieved successfully');
  res.status(response.statusCode).json(response);
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const comment = await commentService.updateComment(req.params.id, content, req.user.id);
  const response = new ApiResponse(HTTP_STATUS.OK, { comment }, 'Comment updated successfully');
  res.status(response.statusCode).json(response);
});

const deleteComment = asyncHandler(async (req, res) => {
  const data = await commentService.deleteComment(req.params.id, req.user.id, req.user.role);
  const response = new ApiResponse(HTTP_STATUS.OK, data, 'Comment deleted successfully');
  res.status(response.statusCode).json(response);
});

module.exports = {
  createComment,
  getCommentsByNote,
  updateComment,
  deleteComment,
};

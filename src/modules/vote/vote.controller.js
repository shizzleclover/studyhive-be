const voteService = require('./vote.service');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const asyncHandler = require('../../shared/utils/asyncHandler');

const castVote = asyncHandler(async (req, res) => {
  const { entityType, entityId, voteType } = req.body;
  const data = await voteService.castVote(req.user.id, entityType, entityId, voteType);
  const response = new ApiResponse(HTTP_STATUS.OK, data, data.message);
  res.status(response.statusCode).json(response);
});

const removeVote = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.body;
  const data = await voteService.removeVote(req.user.id, entityType, entityId);
  const response = new ApiResponse(HTTP_STATUS.OK, data, data.message);
  res.status(response.statusCode).json(response);
});

const getUserVote = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.query;
  const vote = await voteService.getUserVote(req.user.id, entityType, entityId);
  const response = new ApiResponse(HTTP_STATUS.OK, { vote }, 'User vote retrieved');
  res.status(response.statusCode).json(response);
});

const getVoteCounts = asyncHandler(async (req, res) => {
  const { entityType, entityId } = req.query;
  const counts = await voteService.getVoteCounts(entityType, entityId);
  const response = new ApiResponse(HTTP_STATUS.OK, counts, 'Vote counts retrieved');
  res.status(response.statusCode).json(response);
});

module.exports = {
  castVote,
  removeVote,
  getUserVote,
  getVoteCounts,
};

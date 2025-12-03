const leaderboardService = require('./leaderboard.service');
const asyncHandler = require('../../shared/utils/asyncHandler');
const ApiResponse = require('../../shared/utils/ApiResponse');

/**
 * Get global leaderboard
 */
const getGlobalLeaderboard = asyncHandler(async (req, res) => {
  const result = await leaderboardService.getGlobalLeaderboard(req.query);
  res.json(new ApiResponse(200, 'Leaderboard retrieved successfully', result.users, result.pagination));
});

/**
 * Get top contributors
 */
const getTopContributors = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const contributors = await leaderboardService.getTopContributors(limit);
  res.json(new ApiResponse(200, 'Top contributors retrieved successfully', contributors));
});

/**
 * Get quiz champions
 */
const getQuizChampions = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const champions = await leaderboardService.getQuizChampions(limit);
  res.json(new ApiResponse(200, 'Quiz champions retrieved successfully', champions));
});

/**
 * Get user's leaderboard position
 */
const getUserPosition = asyncHandler(async (req, res) => {
  const position = await leaderboardService.getUserPosition(req.user._id);
  res.json(new ApiResponse(200, 'User position retrieved successfully', position));
});

/**
 * Get leaderboard statistics
 */
const getLeaderboardStats = asyncHandler(async (req, res) => {
  const stats = await leaderboardService.getLeaderboardStats();
  res.json(new ApiResponse(200, 'Leaderboard statistics retrieved successfully', stats));
});

/**
 * Get users nearby on leaderboard
 */
const getUsersNearby = asyncHandler(async (req, res) => {
  const range = parseInt(req.query.range) || 5;
  const users = await leaderboardService.getUsersNearby(req.user._id, range);
  res.json(new ApiResponse(200, 'Nearby users retrieved successfully', users));
});

module.exports = {
  getGlobalLeaderboard,
  getTopContributors,
  getQuizChampions,
  getUserPosition,
  getLeaderboardStats,
  getUsersNearby,
};

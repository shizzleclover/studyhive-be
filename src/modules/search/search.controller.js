const searchService = require('./search.service');
const asyncHandler = require('../../shared/utils/asyncHandler');
const ApiResponse = require('../../shared/utils/ApiResponse');

/**
 * Global search across all resources
 */
const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const result = await searchService.globalSearch(q, req.query);
  res.json(new ApiResponse(200, 'Search completed successfully', result.results, result.pagination, { counts: result.counts }));
});

/**
 * Search courses
 */
const searchCourses = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const result = await searchService.searchCourses(q, req.query);
  res.json(new ApiResponse(200, 'Courses search completed', result.courses, result.pagination));
});

/**
 * Search community notes
 */
const searchCommunityNotes = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const result = await searchService.searchCommunityNotes(q, req.query);
  res.json(new ApiResponse(200, 'Notes search completed', result.notes, result.pagination));
});

/**
 * Search past questions
 */
const searchPastQuestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const result = await searchService.searchPastQuestions(q, req.query);
  res.json(new ApiResponse(200, 'Past questions search completed', result.pastQuestions, result.pagination));
});

/**
 * Search users
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const result = await searchService.searchUsers(q, req.query);
  res.json(new ApiResponse(200, 'Users search completed', result.users, result.pagination));
});

/**
 * Get search suggestions (autocomplete)
 */
const getSearchSuggestions = asyncHandler(async (req, res) => {
  const { q, type } = req.query;
  const suggestions = await searchService.getSearchSuggestions(q, type);
  res.json(new ApiResponse(200, 'Suggestions retrieved successfully', suggestions));
});

/**
 * Get trending searches
 */
const getTrendingSearches = asyncHandler(async (req, res) => {
  const trending = await searchService.getTrendingSearches();
  res.json(new ApiResponse(200, 'Trending searches retrieved successfully', trending));
});

module.exports = {
  globalSearch,
  searchCourses,
  searchCommunityNotes,
  searchPastQuestions,
  searchUsers,
  getSearchSuggestions,
  getTrendingSearches,
};


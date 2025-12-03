const quizService = require('./quiz.service');
const asyncHandler = require('../../shared/utils/asyncHandler');
const ApiResponse = require('../../shared/utils/ApiResponse');

/**
 * Create a new quiz
 */
const createQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.createQuiz(req.body, req.user._id);
  res.status(201).json(new ApiResponse(201, 'Quiz created successfully', quiz));
});

/**
 * Get all quizzes
 */
const getAllQuizzes = asyncHandler(async (req, res) => {
  const result = await quizService.getAllQuizzes(req.query);
  res.json(new ApiResponse(200, 'Quizzes retrieved successfully', result.quizzes, result.pagination));
});

/**
 * Get quiz by ID
 */
const getQuizById = asyncHandler(async (req, res) => {
  const isAttempting = req.query.attempting === 'true';
  const quiz = await quizService.getQuizById(req.params.id, req.user?._id, isAttempting);
  res.json(new ApiResponse(200, 'Quiz retrieved successfully', quiz));
});

/**
 * Get quizzes by course
 */
const getQuizzesByCourse = asyncHandler(async (req, res) => {
  const result = await quizService.getQuizzesByCourse(req.params.courseId, req.query);
  res.json(new ApiResponse(200, 'Course quizzes retrieved successfully', result.quizzes, result.pagination));
});

/**
 * Update quiz
 */
const updateQuiz = asyncHandler(async (req, res) => {
  const quiz = await quizService.updateQuiz(req.params.id, req.body, req.user._id);
  res.json(new ApiResponse(200, 'Quiz updated successfully', quiz));
});

/**
 * Delete quiz
 */
const deleteQuiz = asyncHandler(async (req, res) => {
  const result = await quizService.deleteQuiz(req.params.id, req.user._id);
  res.json(new ApiResponse(200, result.message));
});

/**
 * Submit quiz attempt
 */
const submitQuizAttempt = asyncHandler(async (req, res) => {
  const { answers, timeSpent } = req.body;
  const attempt = await quizService.submitQuizAttempt(req.params.id, answers, timeSpent, req.user._id);
  res.status(201).json(new ApiResponse(201, 'Quiz attempt submitted successfully', attempt));
});

/**
 * Get user's attempts for a quiz
 */
const getUserQuizAttempts = asyncHandler(async (req, res) => {
  const attempts = await quizService.getUserQuizAttempts(req.params.id, req.user._id);
  res.json(new ApiResponse(200, 'Quiz attempts retrieved successfully', attempts));
});

/**
 * Get all user attempts
 */
const getAllUserAttempts = asyncHandler(async (req, res) => {
  const result = await quizService.getAllUserAttempts(req.user._id, req.query);
  res.json(new ApiResponse(200, 'User attempts retrieved successfully', result.attempts, result.pagination));
});

/**
 * Get attempt details (for review)
 */
const getAttemptDetails = asyncHandler(async (req, res) => {
  const attempt = await quizService.getAttemptDetails(req.params.attemptId, req.user._id);
  res.json(new ApiResponse(200, 'Attempt details retrieved successfully', attempt));
});

/**
 * Toggle publish status
 */
const togglePublishStatus = asyncHandler(async (req, res) => {
  const { isPublished } = req.body;
  const quiz = await quizService.togglePublishStatus(req.params.id, req.user._id, isPublished);
  const message = isPublished ? 'Quiz published successfully' : 'Quiz unpublished successfully';
  res.json(new ApiResponse(200, message, quiz));
});

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  getQuizzesByCourse,
  updateQuiz,
  deleteQuiz,
  submitQuizAttempt,
  getUserQuizAttempts,
  getAllUserAttempts,
  getAttemptDetails,
  togglePublishStatus,
};

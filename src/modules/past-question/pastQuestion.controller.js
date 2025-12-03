const pastQuestionService = require('./pastQuestion.service');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const asyncHandler = require('../../shared/utils/asyncHandler');

/**
 * @route   POST /api/past-questions
 * @desc    Create a new past question (rep/admin only)
 * @access  Private (Rep/Admin)
 */
const createPastQuestion = asyncHandler(async (req, res) => {
  const pastQuestion = await pastQuestionService.createPastQuestion(req.body, req.user.id);

  const response = new ApiResponse(
    HTTP_STATUS.CREATED,
    { pastQuestion },
    'Past question uploaded successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/past-questions
 * @desc    Get all past questions with filters
 * @access  Public
 */
const getAllPastQuestions = asyncHandler(async (req, res) => {
  const { page, limit, course, year, semester, type, search } = req.query;

  const data = await pastQuestionService.getAllPastQuestions(
    parseInt(page),
    parseInt(limit),
    { course, year, semester, type, search }
  );

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Past questions retrieved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/past-questions/course/:courseId
 * @desc    Get past questions by course
 * @access  Public
 */
const getPastQuestionsByCourse = asyncHandler(async (req, res) => {
  const { page, limit, year, semester, type } = req.query;

  const data = await pastQuestionService.getPastQuestionsByCourse(
    req.params.courseId,
    parseInt(page),
    parseInt(limit),
    { year, semester, type }
  );

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Past questions retrieved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/past-questions/:id
 * @desc    Get past question by ID
 * @access  Public
 */
const getPastQuestionById = asyncHandler(async (req, res) => {
  const pastQuestion = await pastQuestionService.getPastQuestionById(req.params.id);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { pastQuestion },
    'Past question retrieved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/past-questions/:id/download
 * @desc    Get download URL for past question
 * @access  Private
 */
const getDownloadUrl = asyncHandler(async (req, res) => {
  const data = await pastQuestionService.getDownloadUrl(req.params.id, req.user.id);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Download URL generated successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   PUT /api/past-questions/:id
 * @desc    Update past question (rep/admin only)
 * @access  Private (Rep/Admin)
 */
const updatePastQuestion = asyncHandler(async (req, res) => {
  const pastQuestion = await pastQuestionService.updatePastQuestion(
    req.params.id,
    req.body,
    req.user.id
  );

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { pastQuestion },
    'Past question updated successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   DELETE /api/past-questions/:id
 * @desc    Delete past question (rep/admin only)
 * @access  Private (Rep/Admin)
 */
const deletePastQuestion = asyncHandler(async (req, res) => {
  const data = await pastQuestionService.deletePastQuestion(req.params.id);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Past question deleted successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   PATCH /api/past-questions/:id/verify
 * @desc    Toggle verification status (rep/admin only)
 * @access  Private (Rep/Admin)
 */
const toggleVerification = asyncHandler(async (req, res) => {
  const { isVerified } = req.body;

  const pastQuestion = await pastQuestionService.toggleVerification(req.params.id, isVerified);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { pastQuestion },
    `Past question ${isVerified ? 'verified' : 'unverified'} successfully`
  );

  res.status(response.statusCode).json(response);
});

module.exports = {
  createPastQuestion,
  getAllPastQuestions,
  getPastQuestionsByCourse,
  getPastQuestionById,
  getDownloadUrl,
  updatePastQuestion,
  deletePastQuestion,
  toggleVerification,
};


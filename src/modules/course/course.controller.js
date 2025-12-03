const courseService = require('./course.service');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const asyncHandler = require('../../shared/utils/asyncHandler');

/**
 * @route   POST /api/courses
 * @desc    Create a new course (admin only)
 * @access  Private (Admin)
 */
const createCourse = asyncHandler(async (req, res) => {
  const course = await courseService.createCourse(req.body, req.user.id);

  const response = new ApiResponse(
    HTTP_STATUS.CREATED,
    { course },
    'Course created successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/courses
 * @desc    Get all courses with filters
 * @access  Public
 */
const getAllCourses = asyncHandler(async (req, res) => {
  const { page, limit, level, department, semester, isActive, search } = req.query;

  const data = await courseService.getAllCourses(
    parseInt(page),
    parseInt(limit),
    { level, department, semester, isActive, search }
  );

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Courses retrieved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/courses/:id
 * @desc    Get course by ID
 * @access  Public
 */
const getCourseById = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseById(req.params.id);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { course },
    'Course retrieved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/courses/code/:code
 * @desc    Get course by code
 * @access  Public
 */
const getCourseByCode = asyncHandler(async (req, res) => {
  const course = await courseService.getCourseByCode(req.params.code);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { course },
    'Course retrieved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/courses/level/:levelId
 * @desc    Get courses by level
 * @access  Public
 */
const getCoursesByLevel = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const data = await courseService.getCoursesByLevel(
    req.params.levelId,
    parseInt(page),
    parseInt(limit)
  );

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Courses retrieved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   PUT /api/courses/:id
 * @desc    Update course (admin only)
 * @access  Private (Admin)
 */
const updateCourse = asyncHandler(async (req, res) => {
  const course = await courseService.updateCourse(req.params.id, req.body);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { course },
    'Course updated successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   DELETE /api/courses/:id
 * @desc    Delete course (admin only)
 * @access  Private (Admin)
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const data = await courseService.deleteCourse(req.params.id);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Course deleted successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   PATCH /api/courses/:id/status
 * @desc    Toggle course status (admin only)
 * @access  Private (Admin)
 */
const toggleCourseStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const course = await courseService.toggleCourseStatus(req.params.id, isActive);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { course },
    `Course ${isActive ? 'activated' : 'deactivated'} successfully`
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   POST /api/courses/:id/assign-reps
 * @desc    Assign reps to course (admin only)
 * @access  Private (Admin)
 */
const assignReps = asyncHandler(async (req, res) => {
  const { repIds } = req.body;

  const course = await courseService.assignReps(req.params.id, repIds);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { course },
    'Reps assigned successfully'
  );

  res.status(response.statusCode).json(response);
});

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  getCourseByCode,
  getCoursesByLevel,
  updateCourse,
  deleteCourse,
  toggleCourseStatus,
  assignReps,
};


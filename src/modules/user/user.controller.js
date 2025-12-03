const userService = require('./user.service');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const asyncHandler = require('../../shared/utils/asyncHandler');

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID
 * @access  Public
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { user },
    'User retrieved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update own profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { user },
    'Profile updated successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const { page, limit, role, isVerified, search } = req.query;

  const data = await userService.getAllUsers(
    parseInt(page),
    parseInt(limit),
    { role, isVerified, search }
  );

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Users retrieved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update user role (admin only)
 * @access  Private (Admin)
 */
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  const user = await userService.updateUserRole(req.params.id, role);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { user },
    'User role updated successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   PATCH /api/users/:id/deactivate
 * @desc    Deactivate user (admin only)
 * @access  Private (Admin)
 */
const deactivateUser = asyncHandler(async (req, res) => {
  const user = await userService.deactivateUser(req.params.id);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { user },
    'User deactivated successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Activate user (admin only)
 * @access  Private (Admin)
 */
const activateUser = asyncHandler(async (req, res) => {
  const user = await userService.activateUser(req.params.id);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { user },
    'User activated successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   POST /api/users/:id/assign-courses
 * @desc    Assign courses to rep (admin only)
 * @access  Private (Admin)
 */
const assignCourses = asyncHandler(async (req, res) => {
  const { courseIds } = req.body;

  const user = await userService.assignCoursesToRep(req.params.id, courseIds);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { user },
    'Courses assigned successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   POST /api/users/notes/:noteId/save
 * @desc    Save a note
 * @access  Private
 */
const saveNote = asyncHandler(async (req, res) => {
  const data = await userService.saveNote(req.user.id, req.params.noteId);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Note saved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   DELETE /api/users/notes/:noteId/save
 * @desc    Unsave a note
 * @access  Private
 */
const unsaveNote = asyncHandler(async (req, res) => {
  const data = await userService.unsaveNote(req.user.id, req.params.noteId);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Note unsaved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/users/saved-notes
 * @desc    Get saved notes
 * @access  Private
 */
const getSavedNotes = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;

  const data = await userService.getSavedNotes(
    req.user.id,
    parseInt(page),
    parseInt(limit)
  );

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Saved notes retrieved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/users/:id/stats
 * @desc    Get user statistics
 * @access  Public
 */
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats(req.params.id);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { stats },
    'User statistics retrieved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   POST /api/users/:id/update-reputation
 * @desc    Update user reputation (admin or cron job)
 * @access  Private (Admin)
 */
const updateReputation = asyncHandler(async (req, res) => {
  const user = await userService.updateReputation(req.params.id);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { user },
    'Reputation updated successfully'
  );

  res.status(response.statusCode).json(response);
});

module.exports = {
  getUserById,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deactivateUser,
  activateUser,
  assignCourses,
  saveNote,
  unsaveNote,
  getSavedNotes,
  getUserStats,
  updateReputation,
};


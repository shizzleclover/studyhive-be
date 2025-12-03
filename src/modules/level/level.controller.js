const levelService = require('./level.service');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const asyncHandler = require('../../shared/utils/asyncHandler');

/**
 * @route   POST /api/levels
 * @desc    Create a new level (admin only)
 * @access  Private (Admin)
 */
const createLevel = asyncHandler(async (req, res) => {
  const level = await levelService.createLevel(req.body, req.user.id);

  const response = new ApiResponse(
    HTTP_STATUS.CREATED,
    { level },
    'Level created successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/levels
 * @desc    Get all levels
 * @access  Public
 */
const getAllLevels = asyncHandler(async (req, res) => {
  const { isActive } = req.query;

  const levels = await levelService.getAllLevels({ isActive });

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { levels, total: levels.length },
    'Levels retrieved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/levels/:id
 * @desc    Get level by ID
 * @access  Public
 */
const getLevelById = asyncHandler(async (req, res) => {
  const level = await levelService.getLevelById(req.params.id);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { level },
    'Level retrieved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   GET /api/levels/code/:code
 * @desc    Get level by code
 * @access  Public
 */
const getLevelByCode = asyncHandler(async (req, res) => {
  const level = await levelService.getLevelByCode(req.params.code);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { level },
    'Level retrieved successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   PUT /api/levels/:id
 * @desc    Update level (admin only)
 * @access  Private (Admin)
 */
const updateLevel = asyncHandler(async (req, res) => {
  const level = await levelService.updateLevel(req.params.id, req.body);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { level },
    'Level updated successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   DELETE /api/levels/:id
 * @desc    Delete level (admin only)
 * @access  Private (Admin)
 */
const deleteLevel = asyncHandler(async (req, res) => {
  const data = await levelService.deleteLevel(req.params.id);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Level deleted successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   PATCH /api/levels/:id/status
 * @desc    Toggle level status (admin only)
 * @access  Private (Admin)
 */
const toggleLevelStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const level = await levelService.toggleLevelStatus(req.params.id, isActive);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { level },
    `Level ${isActive ? 'activated' : 'deactivated'} successfully`
  );

  res.status(response.statusCode).json(response);
});

module.exports = {
  createLevel,
  getAllLevels,
  getLevelById,
  getLevelByCode,
  updateLevel,
  deleteLevel,
  toggleLevelStatus,
};


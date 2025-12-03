const Level = require('./level.model');
const ApiError = require('../../shared/utils/ApiError');
const { HTTP_STATUS } = require('../../shared/utils/constants');

/**
 * Create a new level
 */
const createLevel = async (data, userId) => {
  const { name, code, description, order } = data;

  // Check if level with same code already exists
  const existingLevel = await Level.findOne({ code });
  if (existingLevel) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Level with this code already exists');
  }

  const level = await Level.create({
    name,
    code,
    description,
    order,
    createdBy: userId,
  });

  return level;
};

/**
 * Get all levels
 */
const getAllLevels = async (filters = {}) => {
  const query = {};

  // Filter by active status
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  const levels = await Level.find(query)
    .sort({ order: 1 })
    .populate('createdBy', 'name email');

  return levels;
};

/**
 * Get level by ID
 */
const getLevelById = async (levelId) => {
  const level = await Level.findById(levelId).populate('createdBy', 'name email');

  if (!level) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Level not found');
  }

  return level;
};

/**
 * Get level by code
 */
const getLevelByCode = async (code) => {
  const level = await Level.findOne({ code: code.toUpperCase() });

  if (!level) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Level not found');
  }

  return level;
};

/**
 * Update level
 */
const updateLevel = async (levelId, updates) => {
  const level = await Level.findById(levelId);

  if (!level) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Level not found');
  }

  // Check if code is being updated and already exists
  if (updates.code && updates.code !== level.code) {
    const existingLevel = await Level.findOne({ code: updates.code });
    if (existingLevel) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Level with this code already exists');
    }
  }

  Object.assign(level, updates);
  await level.save();

  return level;
};

/**
 * Delete level
 */
const deleteLevel = async (levelId) => {
  const level = await Level.findById(levelId);

  if (!level) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Level not found');
  }

  // Check if level has associated courses
  const Course = require('../course/course.model');
  const courseCount = await Course.countDocuments({ level: levelId });

  if (courseCount > 0) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `Cannot delete level with ${courseCount} associated courses. Delete courses first.`
    );
  }

  await level.deleteOne();

  return { message: 'Level deleted successfully' };
};

/**
 * Activate/deactivate level
 */
const toggleLevelStatus = async (levelId, isActive) => {
  const level = await Level.findByIdAndUpdate(
    levelId,
    { isActive },
    { new: true, runValidators: true }
  );

  if (!level) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Level not found');
  }

  return level;
};

module.exports = {
  createLevel,
  getAllLevels,
  getLevelById,
  getLevelByCode,
  updateLevel,
  deleteLevel,
  toggleLevelStatus,
};


const Course = require('./course.model');
const Level = require('../level/level.model');
const ApiError = require('../../shared/utils/ApiError');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const { getPaginationMetadata } = require('../../shared/utils/helpers');

/**
 * Create a new course
 */
const createCourse = async (data, userId) => {
  const { title, code, description, level, department, creditUnits, semester, assignedReps } = data;

  // Verify level exists
  const levelExists = await Level.findById(level);
  if (!levelExists) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Level not found');
  }

  // Check if course with same code already exists
  const existingCourse = await Course.findOne({ code });
  if (existingCourse) {
    throw new ApiError(HTTP_STATUS.CONFLICT, 'Course with this code already exists');
  }

  const course = await Course.create({
    title,
    code,
    description,
    level,
    department,
    creditUnits,
    semester,
    assignedReps: assignedReps || [],
    createdBy: userId,
  });

  await course.populate([
    { path: 'level', select: 'name code' },
    { path: 'createdBy', select: 'name email' },
    { path: 'assignedReps', select: 'name email role' },
  ]);

  return course;
};

/**
 * Get all courses with filters and pagination
 */
const getAllCourses = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  const query = {};

  // Filter by level
  if (filters.level) {
    query.level = filters.level;
  }

  // Filter by department
  if (filters.department) {
    query.department = { $regex: filters.department, $options: 'i' };
  }

  // Filter by semester
  if (filters.semester) {
    query.semester = filters.semester;
  }

  // Filter by active status
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive;
  }

  // Search by text
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const [courses, total] = await Promise.all([
    Course.find(query)
      .populate('level', 'name code')
      .populate('createdBy', 'name email')
      .populate('assignedReps', 'name email role')
      .sort({ code: 1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments(query),
  ]);

  const pagination = getPaginationMetadata(page, limit, total);

  return { courses, pagination };
};

/**
 * Get course by ID
 */
const getCourseById = async (courseId) => {
  const course = await Course.findById(courseId)
    .populate('level', 'name code')
    .populate('createdBy', 'name email')
    .populate('assignedReps', 'name email role');

  if (!course) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  return course;
};

/**
 * Get course by code
 */
const getCourseByCode = async (code) => {
  const course = await Course.findOne({ code: code.toUpperCase() })
    .populate('level', 'name code')
    .populate('createdBy', 'name email')
    .populate('assignedReps', 'name email role');

  if (!course) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  return course;
};

/**
 * Get courses by level
 */
const getCoursesByLevel = async (levelId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  // Verify level exists
  const levelExists = await Level.findById(levelId);
  if (!levelExists) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Level not found');
  }

  const [courses, total] = await Promise.all([
    Course.find({ level: levelId, isActive: true })
      .populate('createdBy', 'name email')
      .populate('assignedReps', 'name email role')
      .sort({ code: 1 })
      .skip(skip)
      .limit(limit),
    Course.countDocuments({ level: levelId, isActive: true }),
  ]);

  const pagination = getPaginationMetadata(page, limit, total);

  return { courses, pagination, level: levelExists };
};

/**
 * Update course
 */
const updateCourse = async (courseId, updates) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  // Check if code is being updated and already exists
  if (updates.code && updates.code !== course.code) {
    const existingCourse = await Course.findOne({ code: updates.code });
    if (existingCourse) {
      throw new ApiError(HTTP_STATUS.CONFLICT, 'Course with this code already exists');
    }
  }

  // Verify level exists if being updated
  if (updates.level) {
    const levelExists = await Level.findById(updates.level);
    if (!levelExists) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Level not found');
    }
  }

  Object.assign(course, updates);
  await course.save();

  await course.populate([
    { path: 'level', select: 'name code' },
    { path: 'createdBy', select: 'name email' },
    { path: 'assignedReps', select: 'name email role' },
  ]);

  return course;
};

/**
 * Delete course
 */
const deleteCourse = async (courseId) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  // Check if course has associated resources
  const hasResources =
    course.pastQuestionsCount > 0 ||
    course.officialNotesCount > 0 ||
    course.communityNotesCount > 0 ||
    course.quizzesCount > 0;

  if (hasResources) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Cannot delete course with associated resources. Delete resources first or deactivate the course.'
    );
  }

  await course.deleteOne();

  return { message: 'Course deleted successfully' };
};

/**
 * Toggle course status
 */
const toggleCourseStatus = async (courseId, isActive) => {
  const course = await Course.findByIdAndUpdate(
    courseId,
    { isActive },
    { new: true, runValidators: true }
  ).populate([
    { path: 'level', select: 'name code' },
    { path: 'createdBy', select: 'name email' },
  ]);

  if (!course) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  return course;
};

/**
 * Assign reps to course
 */
const assignReps = async (courseId, repIds) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  // Verify all rep IDs exist
  const User = require('../user/user.model');
  const reps = await User.find({
    _id: { $in: repIds },
    role: { $in: ['rep', 'admin'] },
  });

  if (reps.length !== repIds.length) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'One or more invalid rep IDs');
  }

  course.assignedReps = repIds;
  await course.save();

  await course.populate('assignedReps', 'name email role');

  return course;
};

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


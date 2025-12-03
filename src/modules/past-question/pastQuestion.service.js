const PastQuestion = require('./pastQuestion.model');
const Course = require('../course/course.model');
const uploadService = require('../upload/upload.service');
const ApiError = require('../../shared/utils/ApiError');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const { getPaginationMetadata } = require('../../shared/utils/helpers');

/**
 * Create a new past question entry
 */
const createPastQuestion = async (data, userId) => {
  const { course, year, semester, type, title, description, fileKey, fileUrl, fileName, fileSize, fileType } = data;

  // Verify course exists
  const courseExists = await Course.findById(course);
  if (!courseExists) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  // Validate file metadata
  uploadService.validateFileMetadata({ fileName, fileType, fileSize, fileKey });

  const pastQuestion = await PastQuestion.create({
    course,
    year,
    semester,
    type,
    title,
    description,
    fileKey,
    fileUrl,
    fileName,
    fileSize,
    fileType,
    uploadedBy: userId,
  });

  await pastQuestion.populate([
    { path: 'course', select: 'title code' },
    { path: 'uploadedBy', select: 'name email role' },
  ]);

  return pastQuestion;
};

/**
 * Get all past questions with filters and pagination
 */
const getAllPastQuestions = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  const query = { isActive: true };

  // Filter by course
  if (filters.course) {
    query.course = filters.course;
  }

  // Filter by year
  if (filters.year) {
    query.year = parseInt(filters.year);
  }

  // Filter by semester
  if (filters.semester) {
    query.semester = filters.semester;
  }

  // Filter by type
  if (filters.type) {
    query.type = filters.type;
  }

  // Search by text
  if (filters.search) {
    query.$text = { $search: filters.search };
  }

  const [pastQuestions, total] = await Promise.all([
    PastQuestion.find(query)
      .populate('course', 'title code')
      .populate('uploadedBy', 'name email role')
      .sort({ year: -1, semester: 1 })
      .skip(skip)
      .limit(limit),
    PastQuestion.countDocuments(query),
  ]);

  const pagination = getPaginationMetadata(page, limit, total);

  return { pastQuestions, pagination };
};

/**
 * Get past questions by course
 */
const getPastQuestionsByCourse = async (courseId, page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;

  // Verify course exists
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  const query = { course: courseId, isActive: true };

  // Filter by year
  if (filters.year) {
    query.year = parseInt(filters.year);
  }

  // Filter by semester
  if (filters.semester) {
    query.semester = filters.semester;
  }

  // Filter by type
  if (filters.type) {
    query.type = filters.type;
  }

  const [pastQuestions, total] = await Promise.all([
    PastQuestion.find(query)
      .populate('uploadedBy', 'name email role')
      .sort({ year: -1, semester: 1 })
      .skip(skip)
      .limit(limit),
    PastQuestion.countDocuments(query),
  ]);

  const pagination = getPaginationMetadata(page, limit, total);

  return { pastQuestions, pagination, course };
};

/**
 * Get past question by ID
 */
const getPastQuestionById = async (pqId) => {
  const pastQuestion = await PastQuestion.findById(pqId)
    .populate('course', 'title code')
    .populate('uploadedBy', 'name email role');

  if (!pastQuestion) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Past question not found');
  }

  return pastQuestion;
};

/**
 * Update past question
 */
const updatePastQuestion = async (pqId, updates, userId) => {
  const pastQuestion = await PastQuestion.findById(pqId);

  if (!pastQuestion) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Past question not found');
  }

  // Verify course exists if being updated
  if (updates.course) {
    const courseExists = await Course.findById(updates.course);
    if (!courseExists) {
      throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
    }
  }

  Object.assign(pastQuestion, updates);
  await pastQuestion.save();

  await pastQuestion.populate([
    { path: 'course', select: 'title code' },
    { path: 'uploadedBy', select: 'name email role' },
  ]);

  return pastQuestion;
};

/**
 * Delete past question
 */
const deletePastQuestion = async (pqId) => {
  const pastQuestion = await PastQuestion.findById(pqId);

  if (!pastQuestion) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Past question not found');
  }

  await pastQuestion.deleteOne();

  return { message: 'Past question deleted successfully' };
};

/**
 * Get download URL for past question
 */
const getDownloadUrl = async (pqId, userId) => {
  const pastQuestion = await PastQuestion.findById(pqId);

  if (!pastQuestion) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Past question not found');
  }

  if (!pastQuestion.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'This past question is not available');
  }

  // Generate download URL
  const downloadUrl = await uploadService.getDownloadUrl(pastQuestion.fileKey);

  // Increment download count
  pastQuestion.downloadCount += 1;
  await pastQuestion.save();

  return { downloadUrl, pastQuestion };
};

/**
 * Toggle verification status
 */
const toggleVerification = async (pqId, isVerified) => {
  const pastQuestion = await PastQuestion.findByIdAndUpdate(
    pqId,
    { isVerified },
    { new: true, runValidators: true }
  ).populate([
    { path: 'course', select: 'title code' },
    { path: 'uploadedBy', select: 'name email role' },
  ]);

  if (!pastQuestion) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Past question not found');
  }

  return pastQuestion;
};

module.exports = {
  createPastQuestion,
  getAllPastQuestions,
  getPastQuestionsByCourse,
  getPastQuestionById,
  updatePastQuestion,
  deletePastQuestion,
  getDownloadUrl,
  toggleVerification,
};


const OfficialNote = require('./officialNote.model');
const Course = require('../course/course.model');
const uploadService = require('../upload/upload.service');
const ApiError = require('../../shared/utils/ApiError');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const { getPaginationMetadata } = require('../../shared/utils/helpers');

/**
 * Create official note
 */
const createOfficialNote = async (data, userId) => {
  const { course, title, description, category, fileKey, fileUrl, fileName, fileSize, fileType } = data;

  const courseExists = await Course.findById(course);
  if (!courseExists) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  uploadService.validateFileMetadata({ fileName, fileType, fileSize, fileKey });

  const officialNote = await OfficialNote.create({
    course,
    title,
    description,
    category,
    fileKey,
    fileUrl,
    fileName,
    fileSize,
    fileType,
    uploadedBy: userId,
  });

  await officialNote.populate([
    { path: 'course', select: 'title code' },
    { path: 'uploadedBy', select: 'name email role' },
  ]);

  return officialNote;
};

/**
 * Get all official notes
 */
const getAllOfficialNotes = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  const query = { isActive: true };

  if (filters.course) query.course = filters.course;
  if (filters.category) query.category = filters.category;
  if (filters.search) query.$text = { $search: filters.search };

  const [officialNotes, total] = await Promise.all([
    OfficialNote.find(query)
      .populate('course', 'title code')
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    OfficialNote.countDocuments(query),
  ]);

  const pagination = getPaginationMetadata(page, limit, total);
  return { officialNotes, pagination };
};

/**
 * Get official notes by course
 */
const getOfficialNotesByCourse = async (courseId, page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');

  const query = { course: courseId, isActive: true };
  if (filters.category) query.category = filters.category;

  const [officialNotes, total] = await Promise.all([
    OfficialNote.find(query)
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    OfficialNote.countDocuments(query),
  ]);

  const pagination = getPaginationMetadata(page, limit, total);
  return { officialNotes, pagination, course };
};

/**
 * Get official note by ID
 */
const getOfficialNoteById = async (noteId) => {
  const officialNote = await OfficialNote.findById(noteId)
    .populate('course', 'title code')
    .populate('uploadedBy', 'name email role');

  if (!officialNote) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Official note not found');
  return officialNote;
};

/**
 * Update official note
 */
const updateOfficialNote = async (noteId, updates) => {
  const officialNote = await OfficialNote.findById(noteId);
  if (!officialNote) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Official note not found');

  if (updates.course) {
    const courseExists = await Course.findById(updates.course);
    if (!courseExists) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  Object.assign(officialNote, updates);
  await officialNote.save();

  await officialNote.populate([
    { path: 'course', select: 'title code' },
    { path: 'uploadedBy', select: 'name email role' },
  ]);

  return officialNote;
};

/**
 * Delete official note
 */
const deleteOfficialNote = async (noteId) => {
  const officialNote = await OfficialNote.findById(noteId);
  if (!officialNote) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Official note not found');

  await officialNote.deleteOne();
  return { message: 'Official note deleted successfully' };
};

/**
 * Get download URL
 */
const getDownloadUrl = async (noteId) => {
  const officialNote = await OfficialNote.findById(noteId);
  if (!officialNote) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Official note not found');
  if (!officialNote.isActive) throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Note not available');

  const downloadUrl = await uploadService.getDownloadUrl(officialNote.fileKey);

  officialNote.downloadCount += 1;
  await officialNote.save();

  return { downloadUrl, officialNote };
};

module.exports = {
  createOfficialNote,
  getAllOfficialNotes,
  getOfficialNotesByCourse,
  getOfficialNoteById,
  updateOfficialNote,
  deleteOfficialNote,
  getDownloadUrl,
};


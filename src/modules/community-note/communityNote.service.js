const CommunityNote = require('./communityNote.model');
const Course = require('../course/course.model');
const ApiError = require('../../shared/utils/ApiError');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const { getPaginationMetadata } = require('../../shared/utils/helpers');
const { calculateNoteScore } = require('../../shared/utils/scoreCalculator');

/**
 * Create community note
 */
const createCommunityNote = async (data, userId) => {
  const { course, title, content, tags } = data;

  const courseExists = await Course.findById(course);
  if (!courseExists) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');
  }

  const communityNote = await CommunityNote.create({
    course,
    author: userId,
    title,
    content,
    tags: tags || [],
  });

  await communityNote.populate([
    { path: 'course', select: 'title code' },
    { path: 'author', select: 'name email reputationScore' },
  ]);

  return communityNote;
};

/**
 * Get all community notes with filters
 */
const getAllCommunityNotes = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  const query = { isActive: true };

  if (filters.course) query.course = filters.course;
  if (filters.author) query.author = filters.author;
  if (filters.tags) query.tags = { $in: Array.isArray(filters.tags) ? filters.tags : [filters.tags] };
  if (filters.search) query.$text = { $search: filters.search };

  // Sort by pinned first, then by score or date
  let sort = {};
  if (filters.sortBy === 'recent') {
    sort = { isPinned: -1, createdAt: -1 };
  } else if (filters.sortBy === 'popular') {
    sort = { isPinned: -1, score: -1 };
  } else {
    sort = { isPinned: -1, score: -1, createdAt: -1 };
  }

  const [communityNotes, total] = await Promise.all([
    CommunityNote.find(query)
      .populate('course', 'title code')
      .populate('author', 'name email reputationScore profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    CommunityNote.countDocuments(query),
  ]);

  const pagination = getPaginationMetadata(page, limit, total);
  return { communityNotes, pagination };
};

/**
 * Get community notes by course
 */
const getCommunityNotesByCourse = async (courseId, page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  const course = await Course.findById(courseId);
  if (!course) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Course not found');

  const query = { course: courseId, isActive: true };
  if (filters.tags) query.tags = { $in: Array.isArray(filters.tags) ? filters.tags : [filters.tags] };

  let sort = {};
  if (filters.sortBy === 'recent') {
    sort = { isPinned: -1, createdAt: -1 };
  } else {
    sort = { isPinned: -1, score: -1, createdAt: -1 };
  }

  const [communityNotes, total] = await Promise.all([
    CommunityNote.find(query)
      .populate('author', 'name email reputationScore profilePicture')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    CommunityNote.countDocuments(query),
  ]);

  const pagination = getPaginationMetadata(page, limit, total);
  return { communityNotes, pagination, course };
};

/**
 * Get community note by ID
 */
const getCommunityNoteById = async (noteId, incrementView = false) => {
  const communityNote = await CommunityNote.findById(noteId)
    .populate('course', 'title code')
    .populate('author', 'name email reputationScore profilePicture');

  if (!communityNote) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Community note not found');
  }

  if (!communityNote.isActive) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'This note is not available');
  }

  // Increment view count
  if (incrementView) {
    communityNote.viewCount += 1;
    await communityNote.save();
  }

  return communityNote;
};

/**
 * Update community note (author only)
 */
const updateCommunityNote = async (noteId, updates, userId) => {
  const communityNote = await CommunityNote.findById(noteId);

  if (!communityNote) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Community note not found');
  }

  // Only author can update
  if (communityNote.author.toString() !== userId) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You can only edit your own notes');
  }

  const { title, content, tags } = updates;
  if (title) communityNote.title = title;
  if (content) communityNote.content = content;
  if (tags) communityNote.tags = tags;
  communityNote.lastEditedAt = new Date();

  await communityNote.save();

  await communityNote.populate([
    { path: 'course', select: 'title code' },
    { path: 'author', select: 'name email reputationScore' },
  ]);

  return communityNote;
};

/**
 * Delete community note (author, rep, admin)
 */
const deleteCommunityNote = async (noteId, userId, userRole) => {
  const communityNote = await CommunityNote.findById(noteId);

  if (!communityNote) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Community note not found');
  }

  // Author, rep, or admin can delete
  const isAuthor = communityNote.author.toString() === userId;
  const canModerate = ['rep', 'admin'].includes(userRole);

  if (!isAuthor && !canModerate) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Not authorized to delete this note');
  }

  await communityNote.deleteOne();
  return { message: 'Community note deleted successfully' };
};

/**
 * Pin/unpin note (rep/admin only)
 */
const togglePin = async (noteId, isPinned) => {
  const communityNote = await CommunityNote.findByIdAndUpdate(
    noteId,
    { isPinned },
    { new: true }
  ).populate([
    { path: 'course', select: 'title code' },
    { path: 'author', select: 'name email reputationScore' },
  ]);

  if (!communityNote) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Community note not found');
  }

  return communityNote;
};

/**
 * Report note
 */
const reportNote = async (noteId) => {
  const communityNote = await CommunityNote.findByIdAndUpdate(
    noteId,
    { $inc: { reportCount: 1 } },
    { new: true }
  );

  if (!communityNote) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Community note not found');
  }

  // Auto-hide if reports exceed threshold
  if (communityNote.reportCount >= 5) {
    communityNote.isActive = false;
    await communityNote.save();
  }

  return { message: 'Note reported successfully' };
};

/**
 * Get user's saved notes
 */
const getUserNotes = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [communityNotes, total] = await Promise.all([
    CommunityNote.find({ author: userId, isActive: true })
      .populate('course', 'title code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    CommunityNote.countDocuments({ author: userId, isActive: true }),
  ]);

  const pagination = getPaginationMetadata(page, limit, total);
  return { communityNotes, pagination };
};

/**
 * Update note score after vote/save/comment
 */
const updateNoteScore = async (noteId) => {
  const communityNote = await CommunityNote.findById(noteId);
  if (!communityNote) return;

  await communityNote.updateScore();
  return communityNote.score;
};

module.exports = {
  createCommunityNote,
  getAllCommunityNotes,
  getCommunityNotesByCourse,
  getCommunityNoteById,
  updateCommunityNote,
  deleteCommunityNote,
  togglePin,
  reportNote,
  getUserNotes,
  updateNoteScore,
};

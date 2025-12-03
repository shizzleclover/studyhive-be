const User = require('./user.model');
const ApiError = require('../../shared/utils/ApiError');
const { HTTP_STATUS, USER_ROLES } = require('../../shared/utils/constants');
const { getPaginationMetadata } = require('../../shared/utils/helpers');
const { calculateUserReputation } = require('../../shared/utils/scoreCalculator');

/**
 * Get user profile by ID
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  return user;
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updates) => {
  const { name, bio, profilePicture } = updates;

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // Update allowed fields
  if (name) user.name = name;
  if (bio !== undefined) user.bio = bio;
  if (profilePicture !== undefined) user.profilePicture = profilePicture;

  await user.save();

  return user;
};

/**
 * Get all users (admin only) with pagination
 */
const getAllUsers = async (page = 1, limit = 20, filters = {}) => {
  const skip = (page - 1) * limit;
  
  const query = {};
  
  // Filter by role
  if (filters.role) {
    query.role = filters.role;
  }
  
  // Filter by verification status
  if (filters.isVerified !== undefined) {
    query.isVerified = filters.isVerified;
  }
  
  // Search by name or email
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .select('-password -refreshToken -verificationToken -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    User.countDocuments(query),
  ]);

  const pagination = getPaginationMetadata(page, limit, total);

  return { users, pagination };
};

/**
 * Update user role (admin only)
 */
const updateUserRole = async (userId, newRole) => {
  if (!Object.values(USER_ROLES).includes(newRole)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid role');
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role: newRole },
    { new: true, runValidators: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  return user;
};

/**
 * Deactivate user account (admin only)
 */
const deactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  return user;
};

/**
 * Activate user account (admin only)
 */
const activateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: true },
    { new: true }
  ).select('-password -refreshToken');

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  return user;
};

/**
 * Assign courses to rep
 */
const assignCoursesToRep = async (userId, courseIds) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  if (user.role !== USER_ROLES.REP && user.role !== USER_ROLES.ADMIN) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'User must be a rep or admin');
  }

  user.assignedCourses = courseIds;
  await user.save();

  return user;
};

/**
 * Save a note (add to savedNotes)
 */
const saveNote = async (userId, noteId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // Check if already saved
  if (user.savedNotes.includes(noteId)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Note already saved');
  }

  user.savedNotes.push(noteId);
  await user.save();

  return { message: 'Note saved successfully' };
};

/**
 * Unsave a note (remove from savedNotes)
 */
const unsaveNote = async (userId, noteId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  const index = user.savedNotes.indexOf(noteId);
  if (index === -1) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Note not in saved list');
  }

  user.savedNotes.splice(index, 1);
  await user.save();

  return { message: 'Note unsaved successfully' };
};

/**
 * Get user's saved notes
 */
const getSavedNotes = async (userId, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const user = await User.findById(userId)
    .select('savedNotes')
    .populate({
      path: 'savedNotes',
      options: {
        skip,
        limit,
        sort: { createdAt: -1 },
      },
    });

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  const total = user.savedNotes.length;
  const pagination = getPaginationMetadata(page, limit, total);

  return { notes: user.savedNotes, pagination };
};

/**
 * Update user reputation score (called periodically or on events)
 */
const updateReputation = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  // Calculate reputation based on user stats
  const reputationScore = calculateUserReputation({
    noteUpvotesReceived: user.noteUpvotesReceived,
    noteSavesReceived: user.noteSavesReceived,
    commentsCount: user.commentsCount,
    noteDownvotesReceived: user.noteDownvotesReceived,
    quizCorrectAnswers: user.quizCorrectAnswers,
  });

  user.reputationScore = reputationScore;
  await user.save();

  return user;
};

/**
 * Get user statistics
 */
const getUserStats = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  }

  return {
    notesCreated: user.notesCreated,
    noteUpvotesReceived: user.noteUpvotesReceived,
    noteDownvotesReceived: user.noteDownvotesReceived,
    noteSavesReceived: user.noteSavesReceived,
    commentsCount: user.commentsCount,
    quizzesTaken: user.quizzesTaken,
    quizCorrectAnswers: user.quizCorrectAnswers,
    reputationScore: user.reputationScore,
    savedNotesCount: user.savedNotes.length,
  };
};

module.exports = {
  getUserById,
  updateProfile,
  getAllUsers,
  updateUserRole,
  deactivateUser,
  activateUser,
  assignCoursesToRep,
  saveNote,
  unsaveNote,
  getSavedNotes,
  updateReputation,
  getUserStats,
};


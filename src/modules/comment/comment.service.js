const Comment = require('./comment.model');
const CommunityNote = require('../community-note/communityNote.model');
const ApiError = require('../../shared/utils/ApiError');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const { getPaginationMetadata } = require('../../shared/utils/helpers');

const createComment = async (noteId, content, userId) => {
  const note = await CommunityNote.findById(noteId);
  if (!note) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Note not found');
  if (!note.isActive) throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Cannot comment on inactive note');

  const comment = await Comment.create({
    note: noteId,
    user: userId,
    content,
  });

  await comment.populate('user', 'name email profilePicture');
  return comment;
};

const getCommentsByNote = async (noteId, page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  
  const note = await CommunityNote.findById(noteId);
  if (!note) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Note not found');

  const [comments, total] = await Promise.all([
    Comment.find({ note: noteId, isActive: true })
      .populate('user', 'name email profilePicture reputationScore')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit),
    Comment.countDocuments({ note: noteId, isActive: true }),
  ]);

  const pagination = getPaginationMetadata(page, limit, total);
  return { comments, pagination };
};

const updateComment = async (commentId, content, userId) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Comment not found');

  if (comment.user.toString() !== userId) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'You can only edit your own comments');
  }

  comment.content = content;
  await comment.save();

  await comment.populate('user', 'name email profilePicture');
  return comment;
};

const deleteComment = async (commentId, userId, userRole) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Comment not found');

  const isAuthor = comment.user.toString() === userId;
  const canModerate = ['rep', 'admin'].includes(userRole);

  if (!isAuthor && !canModerate) {
    throw new ApiError(HTTP_STATUS.FORBIDDEN, 'Not authorized to delete this comment');
  }

  await comment.deleteOne();
  return { message: 'Comment deleted successfully' };
};

module.exports = {
  createComment,
  getCommentsByNote,
  updateComment,
  deleteComment,
};

const Vote = require('./vote.model');
const CommunityNote = require('../community-note/communityNote.model');
const ApiError = require('../../shared/utils/ApiError');
const { HTTP_STATUS, VOTE_TYPES, ENTITY_TYPES } = require('../../shared/utils/constants');

/**
 * Cast or update vote
 */
const castVote = async (userId, entityType, entityId, voteType) => {
  // Verify entity exists
  if (entityType === ENTITY_TYPES.NOTE) {
    const note = await CommunityNote.findById(entityId);
    if (!note) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Note not found');
  }

  // Check if user already voted
  const existingVote = await Vote.findOne({ user: userId, entityType, entityId });

  if (existingVote) {
    // If same vote type, remove vote (toggle)
    if (existingVote.voteType === voteType) {
      await existingVote.deleteOne();
      return { message: 'Vote removed', action: 'removed' };
    }
    
    // If different vote type, update vote
    existingVote.voteType = voteType;
    await existingVote.save();
    return { message: 'Vote updated', action: 'updated', vote: existingVote };
  }

  // Create new vote
  const vote = await Vote.create({
    user: userId,
    entityType,
    entityId,
    voteType,
  });

  return { message: 'Vote cast successfully', action: 'created', vote };
};

/**
 * Remove vote
 */
const removeVote = async (userId, entityType, entityId) => {
  const vote = await Vote.findOneAndDelete({ user: userId, entityType, entityId });

  if (!vote) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Vote not found');
  }

  return { message: 'Vote removed successfully' };
};

/**
 * Get user's vote on an entity
 */
const getUserVote = async (userId, entityType, entityId) => {
  const vote = await Vote.findOne({ user: userId, entityType, entityId });
  return vote;
};

/**
 * Get vote counts for an entity
 */
const getVoteCounts = async (entityType, entityId) => {
  const [upvoteCount, downvoteCount] = await Promise.all([
    Vote.countDocuments({ entityType, entityId, voteType: VOTE_TYPES.UPVOTE }),
    Vote.countDocuments({ entityType, entityId, voteType: VOTE_TYPES.DOWNVOTE }),
  ]);

  return {
    upvotes: upvoteCount,
    downvotes: downvoteCount,
    total: upvoteCount - downvoteCount,
  };
};

module.exports = {
  castVote,
  removeVote,
  getUserVote,
  getVoteCounts,
};

const mongoose = require('mongoose');
const { VOTE_TYPES, ENTITY_TYPES } = require('../../shared/utils/constants');

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    entityType: {
      type: String,
      enum: Object.values(ENTITY_TYPES),
      required: [true, 'Entity type is required'],
      index: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Entity ID is required'],
      index: true,
    },
    voteType: {
      type: String,
      enum: Object.values(VOTE_TYPES),
      required: [true, 'Vote type is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index: one vote per user per entity
voteSchema.index({ user: 1, entityType: 1, entityId: 1 }, { unique: true });

// Compound index for querying votes on an entity
voteSchema.index({ entityType: 1, entityId: 1, voteType: 1 });

// Update entity vote counts
voteSchema.post('save', async function () {
  await updateEntityVoteCounts(this.entityType, this.entityId);
});

voteSchema.post('deleteOne', { document: true }, async function () {
  await updateEntityVoteCounts(this.entityType, this.entityId);
});

// Helper function to update vote counts on entities
async function updateEntityVoteCounts(entityType, entityId) {
  const Vote = mongoose.model('Vote');
  
  const [upvoteCount, downvoteCount] = await Promise.all([
    Vote.countDocuments({ entityType, entityId, voteType: VOTE_TYPES.UPVOTE }),
    Vote.countDocuments({ entityType, entityId, voteType: VOTE_TYPES.DOWNVOTE }),
  ]);

  if (entityType === ENTITY_TYPES.NOTE) {
    const CommunityNote = mongoose.model('CommunityNote');
    const note = await CommunityNote.findById(entityId);
    if (note) {
      note.upvotes = upvoteCount;
      note.downvotes = downvoteCount;
      await note.updateScore();
      
      // Update author reputation
      const User = mongoose.model('User');
      const author = await User.findById(note.author);
      if (author) {
        author.noteUpvotesReceived = upvoteCount;
        author.noteDownvotesReceived = downvoteCount;
        await author.save();
      }
    }
  }
  // Future: handle ENTITY_TYPES.COMMENT when needed
}

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;

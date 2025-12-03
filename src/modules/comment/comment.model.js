const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityNote',
      required: [true, 'Note is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [1000, 'Comment must not exceed 1000 characters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
commentSchema.index({ note: 1, createdAt: -1 });
commentSchema.index({ user: 1 });
commentSchema.index({ isActive: 1 });

// Update note comment count
commentSchema.post('save', async function () {
  if (this.isNew) {
    const CommunityNote = mongoose.model('CommunityNote');
    const note = await CommunityNote.findById(this.note);
    if (note) {
      note.commentCount += 1;
      await note.updateScore();
    }
    
    // Update user's comment count
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(this.user, {
      $inc: { commentsCount: 1 },
    });
  }
});

commentSchema.post('deleteOne', { document: true }, async function () {
  const CommunityNote = mongoose.model('CommunityNote');
  const note = await CommunityNote.findById(this.note);
  if (note) {
    note.commentCount = Math.max(0, note.commentCount - 1);
    await note.updateScore();
  }
  
  // Update user's comment count
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.user, {
    $inc: { commentsCount: -1 },
  });
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;

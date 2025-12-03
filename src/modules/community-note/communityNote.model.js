const mongoose = require('mongoose');

const communityNoteSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      // HTML/Markdown content from rich text editor
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    
    // Engagement metrics
    upvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    downvotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    saves: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    // Calculated score: (upvotes * 2) + saves + comments - downvotes
    score: {
      type: Number,
      default: 0,
      index: true,
    },
    
    // Moderation
    isPinned: {
      type: Boolean,
      default: false,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    
    // Metadata
    lastEditedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
communityNoteSchema.index({ course: 1, score: -1 });
communityNoteSchema.index({ course: 1, isPinned: -1, score: -1 });
communityNoteSchema.index({ author: 1, createdAt: -1 });
communityNoteSchema.index({ isActive: 1, score: -1 });

// Text search index
communityNoteSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
});

// Virtual for fullContent preview
communityNoteSchema.virtual('preview').get(function () {
  // Strip HTML tags for preview (simple approach)
  const text = this.content.replace(/<[^>]*>/g, '');
  return text.length > 200 ? text.substring(0, 200) + '...' : text;
});

// Update course communityNotesCount
communityNoteSchema.post('save', async function () {
  if (this.isNew) {
    const Course = mongoose.model('Course');
    await Course.findByIdAndUpdate(this.course, {
      $inc: { communityNotesCount: 1 },
    });
    
    // Update author's notesCreated count
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(this.author, {
      $inc: { notesCreated: 1 },
    });
  }
});

communityNoteSchema.post('deleteOne', { document: true }, async function () {
  const Course = mongoose.model('Course');
  await Course.findByIdAndUpdate(this.course, {
    $inc: { communityNotesCount: -1 },
  });
  
  // Update author's notesCreated count
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.author, {
    $inc: { notesCreated: -1 },
  });
});

// Method to calculate and update score
communityNoteSchema.methods.updateScore = async function () {
  this.score = (this.upvotes * 2) + this.saves + this.commentCount - this.downvotes;
  await this.save();
  return this.score;
};

// Ensure virtuals are included
communityNoteSchema.set('toJSON', { virtuals: true });
communityNoteSchema.set('toObject', { virtuals: true });

const CommunityNote = mongoose.model('CommunityNote', communityNoteSchema);

module.exports = CommunityNote;

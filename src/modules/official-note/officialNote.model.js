const mongoose = require('mongoose');

const officialNoteSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description must not exceed 500 characters'],
    },
    category: {
      type: String,
      enum: ['Lecture Notes', 'Slides', 'Textbook', 'Reference Material', 'Other'],
      default: 'Lecture Notes',
    },
    
    // File information
    fileKey: {
      type: String,
      required: [true, 'File key is required'],
      unique: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
    },
    
    // Metadata
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
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
officialNoteSchema.index({ course: 1 });
officialNoteSchema.index({ category: 1 });
officialNoteSchema.index({ uploadedBy: 1 });
officialNoteSchema.index({ isActive: 1 });

// Text search
officialNoteSchema.index({
  title: 'text',
  description: 'text',
});

// Update course officialNotesCount
officialNoteSchema.post('save', async function () {
  const Course = mongoose.model('Course');
  await Course.findByIdAndUpdate(this.course, {
    $inc: { officialNotesCount: 1 },
  });
});

officialNoteSchema.post('deleteOne', { document: true }, async function () {
  const Course = mongoose.model('Course');
  await Course.findByIdAndUpdate(this.course, {
    $inc: { officialNotesCount: -1 },
  });
});

const OfficialNote = mongoose.model('OfficialNote', officialNoteSchema);

module.exports = OfficialNote;


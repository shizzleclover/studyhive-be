const mongoose = require('mongoose');
const { PAST_QUESTION_TYPES } = require('../../shared/utils/constants');

const pastQuestionSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
      index: true,
    },
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2000, 'Year must be 2000 or later'],
      max: [new Date().getFullYear(), `Year cannot be in the future`],
      index: true,
    },
    semester: {
      type: String,
      enum: ['First', 'Second'],
      required: [true, 'Semester is required'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(PAST_QUESTION_TYPES),
      required: [true, 'Type is required'],
      index: true,
      comment: 'Type of past question (exam, quiz, assignment, etc.)',
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
    isVerified: {
      type: Boolean,
      default: false,
      comment: 'Verified by admin/rep for accuracy',
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

// Compound index for efficient queries
pastQuestionSchema.index({ course: 1, year: -1, semester: 1 });
pastQuestionSchema.index({ course: 1, type: 1 });
pastQuestionSchema.index({ uploadedBy: 1 });
pastQuestionSchema.index({ isActive: 1 });

// Text search index
pastQuestionSchema.index({
  title: 'text',
  description: 'text',
});

// Update course pastQuestionsCount when a new PQ is created
pastQuestionSchema.post('save', async function () {
  const Course = mongoose.model('Course');
  await Course.findByIdAndUpdate(this.course, {
    $inc: { pastQuestionsCount: 1 },
  });
});

// Update course pastQuestionsCount when a PQ is deleted
pastQuestionSchema.post('deleteOne', { document: true }, async function () {
  const Course = mongoose.model('Course');
  await Course.findByIdAndUpdate(this.course, {
    $inc: { pastQuestionsCount: -1 },
  });
});

const PastQuestion = mongoose.model('PastQuestion', pastQuestionSchema);

module.exports = PastQuestion;


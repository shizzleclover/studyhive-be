const mongoose = require('mongoose');
const { SEMESTERS } = require('../../shared/utils/constants');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Course code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description must not exceed 1000 characters'],
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level',
      required: [true, 'Level is required'],
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    creditUnits: {
      type: Number,
      min: [1, 'Credit units must be at least 1'],
      max: [6, 'Credit units must not exceed 6'],
      default: 3,
    },
    semester: {
      type: String,
      enum: Object.values(SEMESTERS),
      required: [true, 'Semester is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    
    // Statistics
    pastQuestionsCount: {
      type: Number,
      default: 0,
    },
    officialNotesCount: {
      type: Number,
      default: 0,
    },
    communityNotesCount: {
      type: Number,
      default: 0,
    },
    quizzesCount: {
      type: Number,
      default: 0,
    },
    
    // Assigned reps (optional)
    assignedReps: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast queries
courseSchema.index({ code: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ department: 1 });
courseSchema.index({ semester: 1 });
courseSchema.index({ isActive: 1 });

// Text index for search
courseSchema.index({
  title: 'text',
  code: 'text',
  description: 'text',
  department: 'text',
});

// Virtual for full course name
courseSchema.virtual('fullName').get(function () {
  return `${this.code} - ${this.title}`;
});

// Ensure virtuals are included in JSON
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;


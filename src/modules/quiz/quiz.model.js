const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
  },
  options: [{
    text: {
      type: String,
      required: [true, 'Option text is required'],
      trim: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },
  }],
  explanation: {
    type: String,
    trim: true,
    default: '',
  },
  points: {
    type: Number,
    default: 1,
    min: [1, 'Points must be at least 1'],
  },
}, { _id: true });

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Quiz title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Description must not exceed 1000 characters'],
    },
    
    // Quiz configuration
    questions: {
      type: [questionSchema],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'Quiz must have at least one question',
      },
    },
    timeLimit: {
      type: Number,
      default: null,
      min: [1, 'Time limit must be at least 1 minute'],
      comment: 'Time limit in minutes (null = no limit)',
    },
    passingScore: {
      type: Number,
      default: 50,
      min: [0, 'Passing score cannot be negative'],
      max: [100, 'Passing score cannot exceed 100'],
      comment: 'Passing score percentage (0-100)',
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
      comment: 'Whether to randomize question order',
    },
    shuffleOptions: {
      type: Boolean,
      default: false,
      comment: 'Whether to randomize option order',
    },
    allowReview: {
      type: Boolean,
      default: true,
      comment: 'Whether users can review answers after submission',
    },
    maxAttempts: {
      type: Number,
      default: null,
      min: [1, 'Max attempts must be at least 1'],
      comment: 'Maximum attempts allowed (null = unlimited)',
    },
    
    // Statistics
    attemptsCount: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    passRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      comment: 'Percentage of users who passed',
    },
    
    // Metadata
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      comment: 'Only published quizzes are visible to students',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
quizSchema.index({ course: 1, isPublished: 1 });
quizSchema.index({ createdBy: 1 });
quizSchema.index({ difficulty: 1 });

// Virtual for total points
quizSchema.virtual('totalPoints').get(function() {
  return this.questions.reduce((sum, q) => sum + q.points, 0);
});

// Ensure virtuals are included in JSON
quizSchema.set('toJSON', { virtuals: true });
quizSchema.set('toObject', { virtuals: true });

const Quiz = mongoose.model('Quiz', quizSchema);

module.exports = Quiz;

const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  selectedOptionIndex: {
    type: Number,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  pointsEarned: {
    type: Number,
    default: 0,
  },
}, { _id: false });

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: [true, 'Quiz is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
      index: true,
    },
    
    // Attempt data
    answers: {
      type: [answerSchema],
      required: true,
    },
    
    // Scoring
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      comment: 'Score as percentage',
    },
    pointsEarned: {
      type: Number,
      required: true,
      default: 0,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    
    // Pass/Fail
    isPassed: {
      type: Boolean,
      required: true,
    },
    
    // Time tracking
    timeSpent: {
      type: Number,
      required: true,
      comment: 'Time spent in seconds',
    },
    startedAt: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    
    // Metadata
    attemptNumber: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user attempts on a specific quiz
quizAttemptSchema.index({ quiz: 1, user: 1, attemptNumber: 1 });
quizAttemptSchema.index({ user: 1, createdAt: -1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

module.exports = QuizAttempt;

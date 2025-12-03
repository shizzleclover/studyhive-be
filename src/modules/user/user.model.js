const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES } = require('../../shared/utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name must not exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.STUDENT,
    },
    profilePicture: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: [200, 'Bio must not exceed 200 characters'],
      default: '',
    },
    
    // Email verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationOTP: {
      type: String,
      select: false,
      comment: 'Hashed 6-digit OTP for email verification',
    },
    emailVerificationOTPExpiry: {
      type: Date,
      select: false,
      comment: 'OTP expiry time (10 minutes)',
    },
    // Legacy field - kept for backward compatibility
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpiry: {
      type: Date,
      select: false,
    },
    
    // Password reset
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiry: {
      type: Date,
      select: false,
    },
    
    // Refresh token for JWT
    refreshToken: {
      type: String,
      select: false,
    },
    
    // Reputation & Stats
    reputationScore: {
      type: Number,
      default: 0,
    },
    
    // Notes stats
    notesCreated: {
      type: Number,
      default: 0,
    },
    noteUpvotesReceived: {
      type: Number,
      default: 0,
    },
    noteDownvotesReceived: {
      type: Number,
      default: 0,
    },
    noteSavesReceived: {
      type: Number,
      default: 0,
    },
    
    // Comments stats
    commentsCount: {
      type: Number,
      default: 0,
    },
    
    // Quiz stats
    quizzesTaken: {
      type: Number,
      default: 0,
    },
    quizCorrectAnswers: {
      type: Number,
      default: 0,
    },
    
    // Saved notes
    savedNotes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityNote',
    }],
    
    // Course assignments (for reps)
    assignedCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    }],
    
    // Account status
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.verificationToken;
        delete ret.verificationTokenExpiry;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpiry;
        delete ret.refreshToken;
        return ret;
      },
    },
  }
);

// Index for email lookups
userSchema.index({ email: 1 });

// Index for leaderboard queries
userSchema.index({ reputationScore: -1 });

// Hash password before saving
userSchema.pre('save', async function () {
  // Only hash password if it's modified or new
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to check if user can moderate (rep or admin)
userSchema.methods.canModerate = function () {
  return this.role === USER_ROLES.REP || this.role === USER_ROLES.ADMIN;
};

// Method to check if user is admin
userSchema.methods.isAdmin = function () {
  return this.role === USER_ROLES.ADMIN;
};

const User = mongoose.model('User', userSchema);

module.exports = User;


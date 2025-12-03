const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
      index: true,
    },
    requestType: {
      type: String,
      enum: ['past-question', 'official-note', 'community-note', 'quiz', 'other'],
      required: [true, 'Request type is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Request title is required'],
      trim: true,
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Request description is required'],
      trim: true,
      maxlength: [1000, 'Description must not exceed 1000 characters'],
    },
    
    // Additional context
    specificDetails: {
      year: {
        type: Number,
        min: [2000, 'Year must be 2000 or later'],
        max: [new Date().getFullYear() + 1, 'Year cannot be too far in the future'],
      },
      semester: {
        type: String,
        enum: ['First', 'Second', 'Both', null],
      },
      topic: {
        type: String,
        trim: true,
      },
    },
    
    // Status tracking
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'fulfilled', 'rejected'],
      default: 'pending',
      index: true,
    },
    
    // Voting system for request priority
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
    priority: {
      type: Number,
      default: 0,
      comment: 'Auto-calculated: upvotes - downvotes',
    },
    
    // Fulfillment details
    fulfilledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    fulfilledAt: {
      type: Date,
    },
    fulfillmentNote: {
      type: String,
      trim: true,
      maxlength: [500, 'Fulfillment note must not exceed 500 characters'],
    },
    fulfillmentResourceId: {
      type: mongoose.Schema.Types.ObjectId,
      comment: 'ID of the resource that fulfilled this request',
    },
    fulfillmentResourceType: {
      type: String,
      enum: ['PastQuestion', 'OfficialNote', 'CommunityNote', 'Quiz', null],
    },
    
    // Rejection details
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason must not exceed 500 characters'],
    },
    
    // Creator
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Metadata
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
requestSchema.index({ course: 1, status: 1 });
requestSchema.index({ requestType: 1, status: 1 });
requestSchema.index({ priority: -1 });
requestSchema.index({ createdBy: 1 });
requestSchema.index({ createdAt: -1 });

// Pre-save middleware to calculate priority
requestSchema.pre('save', function(next) {
  this.priority = this.upvotes - this.downvotes;
  next();
});

const Request = mongoose.model('Request', requestSchema);

module.exports = Request;

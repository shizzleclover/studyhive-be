const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Level name is required'],
      trim: true,
      unique: true,
      example: '100 Level',
    },
    code: {
      type: String,
      required: [true, 'Level code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      example: '100L',
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description must not exceed 500 characters'],
    },
    order: {
      type: Number,
      required: true,
      min: 1,
      example: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast queries
levelSchema.index({ code: 1 });
levelSchema.index({ order: 1 });
levelSchema.index({ isActive: 1 });

const Level = mongoose.model('Level', levelSchema);

module.exports = Level;


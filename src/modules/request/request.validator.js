const Joi = require('joi');

const createRequestValidator = {
  body: Joi.object({
    course: Joi.string().hex().length(24).required().messages({
      'any.required': 'Course ID is required',
      'string.hex': 'Invalid course ID format',
      'string.length': 'Invalid course ID format',
    }),
    requestType: Joi.string()
      .valid('past-question', 'official-note', 'community-note', 'quiz', 'other')
      .required()
      .messages({
        'any.required': 'Request type is required',
      }),
    title: Joi.string().trim().max(200).required().messages({
      'any.required': 'Request title is required',
      'string.max': 'Title must not exceed 200 characters',
    }),
    description: Joi.string().trim().max(1000).required().messages({
      'any.required': 'Request description is required',
      'string.max': 'Description must not exceed 1000 characters',
    }),
    specificDetails: Joi.object({
      year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1),
      semester: Joi.string().valid('First', 'Second', 'Both'),
      topic: Joi.string().trim(),
    }),
  }),
};

const updateRequestValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid request ID format',
      'string.length': 'Invalid request ID format',
    }),
  }),
  body: Joi.object({
    title: Joi.string().trim().max(200),
    description: Joi.string().trim().max(1000),
    specificDetails: Joi.object({
      year: Joi.number().integer().min(2000).max(new Date().getFullYear() + 1),
      semester: Joi.string().valid('First', 'Second', 'Both'),
      topic: Joi.string().trim(),
    }),
  }),
};

const getRequestByIdValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid request ID format',
      'string.length': 'Invalid request ID format',
    }),
  }),
};

const getAllRequestsValidator = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    courseId: Joi.string().hex().length(24),
    requestType: Joi.string().valid('past-question', 'official-note', 'community-note', 'quiz', 'other'),
    status: Joi.string().valid('pending', 'in-progress', 'fulfilled', 'rejected'),
    sortBy: Joi.string().valid('recent', 'oldest', 'priority'),
  }),
};

const getRequestsByCourseValidator = {
  params: Joi.object({
    courseId: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid course ID format',
      'string.length': 'Invalid course ID format',
    }),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('pending', 'in-progress', 'fulfilled', 'rejected'),
    requestType: Joi.string().valid('past-question', 'official-note', 'community-note', 'quiz', 'other'),
  }),
};

const getUserRequestsValidator = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('pending', 'in-progress', 'fulfilled', 'rejected'),
  }),
};

const voteOnRequestValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid request ID format',
      'string.length': 'Invalid request ID format',
    }),
  }),
  body: Joi.object({
    voteType: Joi.string().valid('upvote', 'downvote').required().messages({
      'any.required': 'Vote type is required',
    }),
  }),
};

const fulfillRequestValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid request ID format',
      'string.length': 'Invalid request ID format',
    }),
  }),
  body: Joi.object({
    note: Joi.string().trim().max(500).allow(''),
    resourceId: Joi.string().hex().length(24),
    resourceType: Joi.string().valid('PastQuestion', 'OfficialNote', 'CommunityNote', 'Quiz'),
  }),
};

const rejectRequestValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid request ID format',
      'string.length': 'Invalid request ID format',
    }),
  }),
  body: Joi.object({
    reason: Joi.string().trim().max(500).required().messages({
      'any.required': 'Rejection reason is required',
      'string.max': 'Rejection reason must not exceed 500 characters',
    }),
  }),
};

const getRequestStatsValidator = {
  query: Joi.object({
    courseId: Joi.string().hex().length(24),
  }),
};

module.exports = {
  createRequestValidator,
  updateRequestValidator,
  getRequestByIdValidator,
  getAllRequestsValidator,
  getRequestsByCourseValidator,
  getUserRequestsValidator,
  voteOnRequestValidator,
  fulfillRequestValidator,
  rejectRequestValidator,
  getRequestStatsValidator,
};

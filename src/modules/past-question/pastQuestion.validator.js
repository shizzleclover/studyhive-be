const Joi = require('joi');
const { SEMESTERS, PAST_QUESTION_TYPES } = require('../../shared/utils/constants');

const createPastQuestionValidator = {
  body: Joi.object({
    course: Joi.string().hex().length(24).required().messages({
      'any.required': 'Course is required',
    }),
    year: Joi.number()
      .integer()
      .min(2000)
      .max(new Date().getFullYear())
      .required()
      .messages({
        'any.required': 'Year is required',
        'number.min': 'Year must be 2000 or later',
      }),
    semester: Joi.string()
      .valid(...Object.values(SEMESTERS))
      .required()
      .messages({
        'any.required': 'Semester is required',
      }),
    type: Joi.string()
      .valid(...Object.values(PAST_QUESTION_TYPES))
      .required()
      .messages({
        'any.required': 'Type is required',
        'any.only': `Type must be one of: ${Object.values(PAST_QUESTION_TYPES).join(', ')}`,
      }),
    title: Joi.string().required().trim().messages({
      'any.required': 'Title is required',
    }),
    description: Joi.string().max(500).allow(''),
    fileKey: Joi.string().required(),
    fileUrl: Joi.string().uri().required(),
    fileName: Joi.string().required(),
    fileSize: Joi.number().required(),
    fileType: Joi.string().required(),
  }),
};

const updatePastQuestionValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object({
    course: Joi.string().hex().length(24),
    year: Joi.number().integer().min(2000).max(new Date().getFullYear()),
    semester: Joi.string().valid(...Object.values(SEMESTERS)),
    type: Joi.string().valid(...Object.values(PAST_QUESTION_TYPES)),
    title: Joi.string().trim(),
    description: Joi.string().max(500).allow(''),
    isVerified: Joi.boolean(),
    isActive: Joi.boolean(),
  }).min(1),
};

const getPastQuestionByIdValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
};

const getAllPastQuestionsValidator = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    course: Joi.string().hex().length(24),
    year: Joi.number().integer().min(2000),
    semester: Joi.string().valid(...Object.values(SEMESTERS)),
    type: Joi.string().valid(...Object.values(PAST_QUESTION_TYPES)),
    search: Joi.string().max(100),
  }),
};

const getPastQuestionsByCourseValidator = {
  params: Joi.object({
    courseId: Joi.string().hex().length(24).required(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    year: Joi.number().integer().min(2000),
    semester: Joi.string().valid(...Object.values(SEMESTERS)),
    type: Joi.string().valid(...Object.values(PAST_QUESTION_TYPES)),
  }),
};

const toggleVerificationValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object({
    isVerified: Joi.boolean().required(),
  }),
};

module.exports = {
  createPastQuestionValidator,
  updatePastQuestionValidator,
  getPastQuestionByIdValidator,
  getAllPastQuestionsValidator,
  getPastQuestionsByCourseValidator,
  toggleVerificationValidator,
};


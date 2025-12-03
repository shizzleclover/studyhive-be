const Joi = require('joi');
const { SEMESTERS } = require('../../shared/utils/constants');

const createCourseValidator = {
  body: Joi.object({
    title: Joi.string().required().trim().messages({
      'any.required': 'Course title is required',
    }),
    code: Joi.string().required().uppercase().trim().messages({
      'any.required': 'Course code is required',
    }),
    description: Joi.string().max(1000).allow(''),
    level: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid level ID format',
      'any.required': 'Level is required',
    }),
    department: Joi.string().required().trim().messages({
      'any.required': 'Department is required',
    }),
    creditUnits: Joi.number().integer().min(1).max(6).default(3),
    semester: Joi.string()
      .valid(...Object.values(SEMESTERS))
      .required()
      .messages({
        'any.only': `Semester must be one of: ${Object.values(SEMESTERS).join(', ')}`,
        'any.required': 'Semester is required',
      }),
    assignedReps: Joi.array().items(Joi.string().hex().length(24)),
  }),
};

const updateCourseValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object({
    title: Joi.string().trim(),
    code: Joi.string().uppercase().trim(),
    description: Joi.string().max(1000).allow(''),
    level: Joi.string().hex().length(24),
    department: Joi.string().trim(),
    creditUnits: Joi.number().integer().min(1).max(6),
    semester: Joi.string().valid(...Object.values(SEMESTERS)),
    isActive: Joi.boolean(),
  }).min(1),
};

const getCourseByIdValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
};

const getCourseByCodeValidator = {
  params: Joi.object({
    code: Joi.string().required().uppercase(),
  }),
};

const getAllCoursesValidator = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    level: Joi.string().hex().length(24),
    department: Joi.string(),
    semester: Joi.string().valid(...Object.values(SEMESTERS)),
    isActive: Joi.boolean(),
    search: Joi.string().max(100),
  }),
};

const getCoursesByLevelValidator = {
  params: Joi.object({
    levelId: Joi.string().hex().length(24).required(),
  }),
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

const toggleCourseStatusValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object({
    isActive: Joi.boolean().required(),
  }),
};

const assignRepsValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object({
    repIds: Joi.array()
      .items(Joi.string().hex().length(24))
      .required()
      .messages({
        'any.required': 'Rep IDs are required',
      }),
  }),
};

module.exports = {
  createCourseValidator,
  updateCourseValidator,
  getCourseByIdValidator,
  getCourseByCodeValidator,
  getAllCoursesValidator,
  getCoursesByLevelValidator,
  toggleCourseStatusValidator,
  assignRepsValidator,
};


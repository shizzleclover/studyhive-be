const Joi = require('joi');
const { USER_ROLES } = require('../../shared/utils/constants');

const updateProfileValidator = {
  body: Joi.object({
    name: Joi.string().min(2).max(50).messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 50 characters',
    }),
    bio: Joi.string().max(200).allow('').messages({
      'string.max': 'Bio must not exceed 200 characters',
    }),
    profilePicture: Joi.string().uri().allow(null, '').messages({
      'string.uri': 'Profile picture must be a valid URL',
    }),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),
};

const getUserByIdValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid user ID format',
      'string.length': 'Invalid user ID format',
      'any.required': 'User ID is required',
    }),
  }),
};

const getAllUsersValidator = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    role: Joi.string().valid(...Object.values(USER_ROLES)),
    isVerified: Joi.boolean(),
    search: Joi.string().max(100),
  }),
};

const updateUserRoleValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid user ID format',
      'string.length': 'Invalid user ID format',
      'any.required': 'User ID is required',
    }),
  }),
  body: Joi.object({
    role: Joi.string()
      .valid(...Object.values(USER_ROLES))
      .required()
      .messages({
        'any.only': `Role must be one of: ${Object.values(USER_ROLES).join(', ')}`,
        'any.required': 'Role is required',
      }),
  }),
};

const assignCoursesValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid user ID format',
      'string.length': 'Invalid user ID format',
      'any.required': 'User ID is required',
    }),
  }),
  body: Joi.object({
    courseIds: Joi.array()
      .items(Joi.string().hex().length(24))
      .required()
      .messages({
        'array.base': 'Course IDs must be an array',
        'any.required': 'Course IDs are required',
      }),
  }),
};

const saveNoteValidator = {
  params: Joi.object({
    noteId: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid note ID format',
      'string.length': 'Invalid note ID format',
      'any.required': 'Note ID is required',
    }),
  }),
};

const getSavedNotesValidator = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
  }),
};

module.exports = {
  updateProfileValidator,
  getUserByIdValidator,
  getAllUsersValidator,
  updateUserRoleValidator,
  assignCoursesValidator,
  saveNoteValidator,
  getSavedNotesValidator,
};


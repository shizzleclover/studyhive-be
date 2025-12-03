const Joi = require('joi');

const createLevelValidator = {
  body: Joi.object({
    name: Joi.string().required().trim().messages({
      'any.required': 'Level name is required',
      'string.empty': 'Level name cannot be empty',
    }),
    code: Joi.string().required().uppercase().trim().messages({
      'any.required': 'Level code is required',
      'string.empty': 'Level code cannot be empty',
    }),
    description: Joi.string().max(500).allow('').messages({
      'string.max': 'Description must not exceed 500 characters',
    }),
    order: Joi.number().integer().min(1).required().messages({
      'any.required': 'Order is required',
      'number.min': 'Order must be at least 1',
    }),
  }),
};

const updateLevelValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid level ID format',
      'string.length': 'Invalid level ID format',
      'any.required': 'Level ID is required',
    }),
  }),
  body: Joi.object({
    name: Joi.string().trim(),
    code: Joi.string().uppercase().trim(),
    description: Joi.string().max(500).allow(''),
    order: Joi.number().integer().min(1),
    isActive: Joi.boolean(),
  }).min(1).messages({
    'object.min': 'At least one field must be provided for update',
  }),
};

const getLevelByIdValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid level ID format',
      'string.length': 'Invalid level ID format',
      'any.required': 'Level ID is required',
    }),
  }),
};

const getLevelByCodeValidator = {
  params: Joi.object({
    code: Joi.string().required().uppercase().messages({
      'any.required': 'Level code is required',
    }),
  }),
};

const getAllLevelsValidator = {
  query: Joi.object({
    isActive: Joi.boolean(),
  }),
};

const toggleLevelStatusValidator = {
  params: Joi.object({
    id: Joi.string().hex().length(24).required().messages({
      'string.hex': 'Invalid level ID format',
      'string.length': 'Invalid level ID format',
      'any.required': 'Level ID is required',
    }),
  }),
  body: Joi.object({
    isActive: Joi.boolean().required().messages({
      'any.required': 'isActive status is required',
    }),
  }),
};

module.exports = {
  createLevelValidator,
  updateLevelValidator,
  getLevelByIdValidator,
  getLevelByCodeValidator,
  getAllLevelsValidator,
  toggleLevelStatusValidator,
};


const Joi = require('joi');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Validation middleware factory
 * @param {Object} schema - Joi schema object with body, params, query keys
 * @returns {Function} Express middleware
 */
const validate = (schema) => {
  return (req, res, next) => {
    const validSchema = {};
    
    // Only validate parts that are defined in schema
    ['params', 'query', 'body'].forEach((key) => {
      if (schema[key]) {
        validSchema[key] = req[key];
      }
    });

    const joiSchema = Joi.object(schema);
    const { error, value } = joiSchema.validate(validSchema, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      return next(
        new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, errorMessage)
      );
    }

    // Replace request data with validated data
    if (value.params) req.params = value.params;
    if (value.query) req.query = value.query;
    if (value.body) req.body = value.body;
    return next();
  };
};

module.exports = validate;

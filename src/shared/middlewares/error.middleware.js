const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Error handler middleware
 * Converts all errors to ApiError format and sends appropriate response
 */
const errorHandler = (err, req, res, next) => {
  let error = err;

  // If not an ApiError instance, convert it
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof Error
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR;

    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, false, err.stack);
  }

  const response = {
    success: false,
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', error);
  }

  res.status(error.statusCode).json(response);
};

/**
 * Handle 404 errors - route not found
 */
const notFoundHandler = (req, res, next) => {
  const error = new ApiError(
    HTTP_STATUS.NOT_FOUND,
    `Route ${req.originalUrl} not found`
  );
  next(error);
};

module.exports = {
  errorHandler,
  notFoundHandler,
};

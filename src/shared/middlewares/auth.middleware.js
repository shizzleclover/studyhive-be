const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS } = require('../utils/constants');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../../config/env');

/**
 * Verify JWT token and attach user to request
 */
const authenticate = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(
      HTTP_STATUS.UNAUTHORIZED,
      'No token provided, authorization denied'
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token using centralized config
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // Attach user info to request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Token expired');
    }
    
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid token');
  }
});

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that work both with and without auth
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch (error) {
    // Silently fail for optional auth
    console.log('Optional auth failed:', error.message);
  }

  next();
});

module.exports = {
  authenticate,
  optionalAuth,
};

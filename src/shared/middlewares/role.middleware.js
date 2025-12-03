const ApiError = require('../utils/ApiError');
const { HTTP_STATUS, USER_ROLES } = require('../utils/constants');

/**
 * Check if user has required role(s)
 * Must be used after authenticate middleware
 * @param {...string} roles - Allowed roles
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ApiError(
          HTTP_STATUS.UNAUTHORIZED,
          'Authentication required'
        )
      );
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          HTTP_STATUS.FORBIDDEN,
          `Access denied. Required role(s): ${roles.join(', ')}`
        )
      );
    }

    next();
  };
};

/**
 * Check if user is student
 */
const requireStudent = requireRole(USER_ROLES.STUDENT, USER_ROLES.REP, USER_ROLES.ADMIN);

/**
 * Check if user is rep or admin
 */
const requireRep = requireRole(USER_ROLES.REP, USER_ROLES.ADMIN);

/**
 * Check if user is admin
 */
const requireAdmin = requireRole(USER_ROLES.ADMIN);

module.exports = {
  requireRole,
  requireStudent,
  requireRep,
  requireAdmin,
};

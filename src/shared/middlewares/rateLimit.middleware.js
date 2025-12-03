const rateLimit = require('express-rate-limit');

/**
 * General rate limiter for all routes
 */
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for auth routes (login, signup)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit to 5 requests per windowMs
  skipSuccessfulRequests: true,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for file uploads
 */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit to 20 uploads per hour
  message: 'Too many upload requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for quiz attempts
 */
const quizLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit to 10 quiz attempts per hour
  message: 'Too many quiz attempts, please take a break',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for search requests
 */
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit to 50 search requests per 15 minutes
  message: 'Too many search requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

const rateLimiters = {
  general: generalLimiter,
  auth: authLimiter,
  upload: uploadLimiter,
  quiz: quizLimiter,
  search: searchLimiter,
};

module.exports = {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  quizLimiter,
  searchLimiter,
  rateLimiters,
};

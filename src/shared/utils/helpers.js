const crypto = require('crypto');

/**
 * Generate a random token
 * @param {number} length - Length of token in bytes (default 32)
 * @returns {string} Hex token
 */
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash a token using SHA256
 * @param {string} token - Token to hash
 * @returns {string} Hashed token
 */
const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Calculate pagination metadata
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
const getPaginationMetadata = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage,
    hasPrevPage,
  };
};

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} File extension with dot
 */
const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 1);
};

/**
 * Check if date is within time window
 * @param {Date} date - Date to check
 * @param {string} window - Time window ('weekly' or 'monthly')
 * @returns {boolean} True if within window
 */
const isWithinTimeWindow = (date, window) => {
  const now = new Date();
  const dateObj = new Date(date);

  if (window === 'weekly') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return dateObj >= weekAgo;
  }

  if (window === 'monthly') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return dateObj >= monthAgo;
  }

  return true; // all-time
};

/**
 * Generate slug from string
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

/**
 * Generate a 6-digit OTP (One-Time Password)
 * @returns {string} 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP using SHA256
 * @param {string} otp - OTP to hash
 * @returns {string} Hashed OTP
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify OTP
 * @param {string} inputOTP - OTP from user
 * @param {string} hashedOTP - Hashed OTP from database
 * @returns {boolean} True if OTP matches
 */
const verifyOTP = (inputOTP, hashedOTP) => {
  const hashedInput = hashOTP(inputOTP);
  return hashedInput === hashedOTP;
};

module.exports = {
  generateToken,
  hashToken,
  generateOTP,
  hashOTP,
  verifyOTP,
  getPaginationMetadata,
  sanitizeInput,
  formatFileSize,
  getFileExtension,
  isWithinTimeWindow,
  slugify,
};

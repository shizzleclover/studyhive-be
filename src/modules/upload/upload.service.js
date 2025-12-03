const { r2 } = require('../../config');
const ApiError = require('../../shared/utils/ApiError');
const { HTTP_STATUS, ALLOWED_FILE_EXTENSIONS, MAX_FILE_SIZE } = require('../../shared/utils/constants');
const { getFileExtension } = require('../../shared/utils/helpers');

/**
 * Generate presigned URL for file upload to R2
 * @param {Object} data - Upload data
 * @param {string} data.fileName - Original file name
 * @param {string} data.fileType - MIME type
 * @param {number} data.fileSize - File size in bytes
 * @param {string} data.folder - Target folder (e.g., 'past-questions', 'official-notes')
 * @returns {Promise<Object>} Upload URL and file key
 */
const getUploadUrl = async (data) => {
  const { fileName, fileType, fileSize, folder } = data;

  // Validate file size
  if (fileSize > MAX_FILE_SIZE) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }

  // Validate file extension
  const extension = `.${getFileExtension(fileName)}`.toLowerCase();
  if (!ALLOWED_FILE_EXTENSIONS.includes(extension)) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `File type not allowed. Allowed types: ${ALLOWED_FILE_EXTENSIONS.join(', ')}`
    );
  }

  // Generate unique file key
  const fileKey = r2.generateFileKey(folder, fileName);

  // Generate presigned upload URL (expires in 1 hour)
  const uploadUrl = await r2.getUploadUrl(fileKey, fileType, 3600);

  // Generate public URL for accessing the file later
  const publicUrl = r2.getPublicUrl(fileKey);

  return {
    uploadUrl,
    fileKey,
    publicUrl,
    expiresIn: 3600, // 1 hour
  };
};

/**
 * Generate presigned URL for file download from R2
 * @param {string} fileKey - File key in R2
 * @param {number} expiresIn - URL expiry in seconds (default 24 hours)
 * @returns {Promise<string>} Download URL
 */
const getDownloadUrl = async (fileKey, expiresIn = 86400) => {
  try {
    const downloadUrl = await r2.getDownloadUrl(fileKey, expiresIn);
    return downloadUrl;
  } catch (error) {
    throw new ApiError(
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'Failed to generate download URL'
    );
  }
};

/**
 * Validate file metadata before recording in database
 */
const validateFileMetadata = (metadata) => {
  const { fileName, fileType, fileSize, fileKey } = metadata;

  if (!fileName || !fileType || !fileSize || !fileKey) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'Missing required file metadata'
    );
  }

  // Validate file size again
  if (fileSize > MAX_FILE_SIZE) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    );
  }

  return true;
};

module.exports = {
  getUploadUrl,
  getDownloadUrl,
  validateFileMetadata,
};

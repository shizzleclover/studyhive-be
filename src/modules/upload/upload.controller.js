const uploadService = require('./upload.service');
const ApiResponse = require('../../shared/utils/ApiResponse');
const { HTTP_STATUS } = require('../../shared/utils/constants');
const asyncHandler = require('../../shared/utils/asyncHandler');

/**
 * @route   POST /api/upload/signed-url
 * @desc    Get presigned URL for file upload to R2
 * @access  Private (Rep/Admin)
 */
const getSignedUploadUrl = asyncHandler(async (req, res) => {
  const { fileName, fileType, fileSize, folder } = req.body;

  const data = await uploadService.getUploadUrl({
    fileName,
    fileType,
    fileSize,
    folder,
  });

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    data,
    'Upload URL generated successfully'
  );

  res.status(response.statusCode).json(response);
});

/**
 * @route   POST /api/upload/download-url
 * @desc    Get presigned URL for file download from R2
 * @access  Private
 */
const getSignedDownloadUrl = asyncHandler(async (req, res) => {
  const { fileKey } = req.body;

  const downloadUrl = await uploadService.getDownloadUrl(fileKey);

  const response = new ApiResponse(
    HTTP_STATUS.OK,
    { downloadUrl },
    'Download URL generated successfully'
  );

  res.status(response.statusCode).json(response);
});

module.exports = {
  getSignedUploadUrl,
  getSignedDownloadUrl,
};

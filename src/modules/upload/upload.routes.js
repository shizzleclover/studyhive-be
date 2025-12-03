const express = require('express');
const uploadController = require('./upload.controller');
const { authenticate } = require('../../shared/middlewares/auth.middleware');
const { requireRep } = require('../../shared/middlewares/role.middleware');
const { uploadLimiter } = require('../../shared/middlewares/rateLimit.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/upload/signed-url:
 *   post:
 *     summary: Get presigned URL for file upload (rep/admin only)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileName
 *               - fileType
 *               - fileSize
 *               - folder
 *             properties:
 *               fileName:
 *                 type: string
 *                 example: CSC101_2023_PQ.pdf
 *               fileType:
 *                 type: string
 *                 example: application/pdf
 *               fileSize:
 *                 type: number
 *                 example: 1048576
 *               folder:
 *                 type: string
 *                 enum: [past-questions, official-notes]
 *                 example: past-questions
 *     responses:
 *       200:
 *         description: Upload URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     uploadUrl:
 *                       type: string
 *                       description: Presigned URL for uploading file to R2
 *                     fileKey:
 *                       type: string
 *                       description: Unique file key in R2
 *                     publicUrl:
 *                       type: string
 *                       description: Public URL for accessing the file
 *                     expiresIn:
 *                       type: number
 *                       description: URL expiry time in seconds
 */
router.post(
  '/signed-url',
  authenticate,
  requireRep,
  uploadLimiter,
  uploadController.getSignedUploadUrl
);

/**
 * @swagger
 * /api/upload/download-url:
 *   post:
 *     summary: Get presigned URL for file download
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fileKey
 *             properties:
 *               fileKey:
 *                 type: string
 *                 example: past-questions/1234567890-abc123-csc101-2023-pq.pdf
 *     responses:
 *       200:
 *         description: Download URL generated successfully
 */
router.post(
  '/download-url',
  authenticate,
  uploadController.getSignedDownloadUrl
);

module.exports = router;

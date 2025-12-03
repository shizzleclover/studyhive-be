const { S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const config = require('./env');

/**
 * Initialize Cloudflare R2 S3 Client
 */
const r2Client = new S3Client({
  region: config.r2.region,
  endpoint: `https://${config.r2.accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2.accessKeyId,
    secretAccessKey: config.r2.secretAccessKey,
  },
});

/**
 * Generate presigned URL for uploading file to R2
 * @param {string} key - File key/path in bucket
 * @param {string} contentType - File MIME type
 * @param {number} expiresIn - URL expiry in seconds (default 1 hour)
 * @returns {Promise<string>} Presigned upload URL
 */
const getUploadUrl = async (key, contentType, expiresIn = 3600) => {
  const command = new PutObjectCommand({
    Bucket: config.r2.bucketName,
    Key: key,
    ContentType: contentType,
  });

  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
  return signedUrl;
};

/**
 * Generate presigned URL for downloading file from R2
 * @param {string} key - File key/path in bucket
 * @param {number} expiresIn - URL expiry in seconds (default 24 hours)
 * @returns {Promise<string>} Presigned download URL
 */
const getDownloadUrl = async (key, expiresIn = 86400) => {
  const command = new GetObjectCommand({
    Bucket: config.r2.bucketName,
    Key: key,
  });

  const signedUrl = await getSignedUrl(r2Client, command, { expiresIn });
  return signedUrl;
};

/**
 * Get public URL for a file (if bucket is public)
 * @param {string} key - File key/path in bucket
 * @returns {string} Public URL
 */
const getPublicUrl = (key) => {
  return `${config.r2.publicUrl}/${key}`;
};

/**
 * Generate unique file key for R2
 * @param {string} folder - Folder name (e.g., 'past-questions', 'official-notes')
 * @param {string} filename - Original filename
 * @returns {string} Unique file key
 */
const generateFileKey = (folder, filename) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = filename.split('.').pop();
  const sanitizedName = filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9]/g, '-') // Replace special chars with dash
    .toLowerCase();
  
  return `${folder}/${timestamp}-${randomString}-${sanitizedName}.${extension}`;
};

module.exports = {
  r2Client,
  getUploadUrl,
  getDownloadUrl,
  getPublicUrl,
  generateFileKey,
};


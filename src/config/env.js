const Joi = require('joi');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Define validation schema for environment variables
const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(5000),
  
  // MongoDB
  MONGODB_URI: Joi.string().required().description('MongoDB connection URI'),
  
  // JWT
  JWT_SECRET: Joi.string().required().description('JWT secret key'),
  JWT_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().required().description('JWT refresh token secret'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  
  // Cloudflare R2
  R2_ACCOUNT_ID: Joi.string().required().description('Cloudflare R2 account ID'),
  R2_ACCESS_KEY_ID: Joi.string().required().description('R2 access key ID'),
  R2_SECRET_ACCESS_KEY: Joi.string().required().description('R2 secret access key'),
  R2_BUCKET_NAME: Joi.string().required().description('R2 bucket name'),
  R2_PUBLIC_URL: Joi.string().uri().required().description('R2 public URL'),
  R2_REGION: Joi.string().default('auto'),
  
  // MailerSend Email Service
  MAILERSEND_API_KEY: Joi.string().required().description('MailerSend API key'),
  MAILERSEND_FROM_EMAIL: Joi.string().email().required().description('Verified sender email in MailerSend'),
  MAILERSEND_FROM_NAME: Joi.string().default('StudyHive').description('Sender name'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX: Joi.number().default(100),
  
  // Frontend URL (for CORS) - can be '*' for allow all origins or a valid URI
  FRONTEND_URL: Joi.alternatives()
    .try(
      Joi.string().valid('*'),
      Joi.string().uri()
    )
    .default('*'),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  
  mongodb: {
    uri: envVars.MONGODB_URI,
  },
  
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    refreshExpiresIn: envVars.JWT_REFRESH_EXPIRES_IN,
  },
  
  r2: {
    accountId: envVars.R2_ACCOUNT_ID,
    accessKeyId: envVars.R2_ACCESS_KEY_ID,
    secretAccessKey: envVars.R2_SECRET_ACCESS_KEY,
    bucketName: envVars.R2_BUCKET_NAME,
    publicUrl: envVars.R2_PUBLIC_URL,
    region: envVars.R2_REGION,
  },
  
  mailersend: {
    apiKey: envVars.MAILERSEND_API_KEY,
    fromEmail: envVars.MAILERSEND_FROM_EMAIL,
    fromName: envVars.MAILERSEND_FROM_NAME,
  },
  
  rateLimit: {
    windowMs: envVars.RATE_LIMIT_WINDOW_MS,
    max: envVars.RATE_LIMIT_MAX,
  },
  
  frontendUrl: envVars.FRONTEND_URL,
};


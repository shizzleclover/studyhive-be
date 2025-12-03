const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const { errorHandler, notFoundHandler } = require('./shared/middlewares/error.middleware');
const { generalLimiter } = require('./shared/middlewares/rateLimit.middleware');
const config = require('./config/env');
const swaggerSpec = require('./config/swagger');

// Create Express app
const app = express();

// Security middleware - relaxed for development test UI
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts for test UI
}));

// CORS configuration - allow all origins for frontend
app.use(cors({
  origin: config.frontendUrl === '*' ? '*' : config.frontendUrl,
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use('/api/', generalLimiter);

// Serve static test UI
app.use(express.static(path.join(__dirname, '../public')));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'StudyHive API Documentation',
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StudyHive API is running',
    timestamp: new Date().toISOString(),
    environment: config.env,
  });
});

// API routes
app.use('/api', require('./modules'));

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Error handler - must be last
app.use(errorHandler);

module.exports = app;

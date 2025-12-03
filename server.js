const app = require('./src/app');
const { config, connectDB, email } = require('./src/config');

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Verify SMTP connection
    await email.verifyConnection();

    // Start Express server
    const server = app.listen(config.port, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 StudyHive API Server Running`);
      console.log(`📍 Environment: ${config.env}`);
      console.log(`🌐 Port: ${config.port}`);
      console.log(`🔗 URL: http://localhost:${config.port}`);
      console.log(`💚 Health: http://localhost:${config.port}/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
      console.log(`\n⚠️ ${signal} received. Closing server gracefully...`);
      
      server.close(async () => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();


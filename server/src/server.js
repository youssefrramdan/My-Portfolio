import { env } from './config/env.js';
import logger from './config/logger.js';
import { connectDB, disconnectDB } from './config/db.js';
import './config/cloudinary.js';
import app from './app.js';

await connectDB().catch(() => process.exit(1));

// Express 5 invokes this callback with the bind error (e.g. EADDRINUSE, or EACCES for a
// Windows-reserved port) instead of throwing, so it must be checked explicitly.
const server = app.listen(env.PORT, (error) => {
  if (error) {
    logger.error(`Failed to bind to port ${env.PORT}: ${error.code ?? error.message}`);
    process.exit(1);
  }
  logger.info(`Server is running on http://localhost:${env.PORT} (${env.NODE_ENV})`);
});

const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    await disconnectDB();
    logger.info('Process terminated');
    process.exit(0);
  });
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  logger.info('Server is shutting down due to unexpected error...');
  process.exit(1);
};

process.on('unhandledRejection', unexpectedErrorHandler);
process.on('uncaughtException', unexpectedErrorHandler);
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

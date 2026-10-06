import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';
import logger from './logger.js';

// Some ISP/corporate DNS servers refuse Node's SRV lookups (querySrv ECONNREFUSED on mongodb+srv URIs).
if (!env.isProd) dns.setServers(['8.8.8.8', '1.1.1.1']);

mongoose.set('strictQuery', true);
// Strips query selectors ($gt, $where, ...) from filter objects built from user input.
mongoose.set('sanitizeFilter', true);

let connecting = null;

/**
 * Connects once and reuses the connection (a serverless instance handles many requests). Throws when MongoDB is
 * unreachable; the next call tries again.
 */
export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  connecting ??= mongoose
    .connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
    .then((conn) => logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`))
    .catch((error) => {
      connecting = null;
      logger.error(`MongoDB connection failed: ${error.message}`);
      logger.error('Check MONGODB_URI and that this host is allowed in Atlas Network Access.');
      throw error;
    });
  await connecting;
}

export async function disconnectDB() {
  await mongoose.connection.close();
}

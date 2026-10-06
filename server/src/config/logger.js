import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, errors, json, colorize, printf } = format;

// Read directly (not from env.js) so the logger works even while env validation is failing.
const isProduction = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
const logsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../logs');

const devFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}]: ${stack ?? message}${extra}`;
});

const logger = createLogger({
  level: isProduction ? 'info' : 'debug',
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new transports.Console({
      format: isProduction
        ? json()
        : combine(colorize({ all: true }), timestamp({ format: 'HH:mm:ss' }), devFormat),
    }),
  ],
});

// Hosts capture stdout (and Vercel's file system is read-only), so rotating files are only written in development.
if (!isProduction) {
  const rotateOptions = { datePattern: 'YYYY-MM-DD', maxSize: '20m', maxFiles: '14d' };
  logger.add(new DailyRotateFile({ filename: path.join(logsDir, 'error-%DATE%.log'), level: 'error', ...rotateOptions }));
  logger.add(new DailyRotateFile({ filename: path.join(logsDir, 'combined-%DATE%.log'), ...rotateOptions }));
}

export default logger;

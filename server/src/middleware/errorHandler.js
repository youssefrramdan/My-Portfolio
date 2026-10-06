import { env } from '../config/env.js';
import logger from '../config/logger.js';
import ApiError from '../utils/ApiError.js';

// ─── JWT ─────────────────────────────────────────────────────────────────────
const handleJwtError = () => new ApiError('Invalid token, please login again.', 401);
const handleJwtExpired = () => new ApiError('Token expired, please login again.', 401);

// ─── Body parser ─────────────────────────────────────────────────────────────
const handleSyntaxError = () => new ApiError('Invalid JSON in request body.', 400);
const handlePayloadTooLarge = () => new ApiError('Request body is too large.', 413);

// ─── Mongoose ────────────────────────────────────────────────────────────────
// Invalid ObjectId (e.g. /projects/abc)
const handleCastError = (err) => new ApiError(`Invalid ${err.path}: ${err.value}`, 400);

// Schema validation failed (required field missing, min/max, ...)
const handleValidationError = (err) => {
  const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  return new ApiError(`Validation failed: ${details.map((d) => d.message).join('. ')}`, 400, details);
};

// Duplicate unique field (e.g. email already exists)
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue ?? {})[0] ?? 'Field';
  return new ApiError(`${field} already exists.`, 409);
};

const normalize = (err) => {
  if (err instanceof ApiError) return err;
  if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) return handleSyntaxError();
  if (err?.type === 'entity.too.large') return handlePayloadTooLarge();
  if (err?.name === 'JsonWebTokenError') return handleJwtError();
  if (err?.name === 'TokenExpiredError') return handleJwtExpired();
  if (err?.name === 'CastError') return handleCastError(err);
  if (err?.name === 'ValidationError') return handleValidationError(err);
  if (err?.code === 11000) return handleDuplicateKeyError(err);
  return err;
};

// ─── Senders ─────────────────────────────────────────────────────────────────
const sendErrorDev = (err, res) =>
  res.status(err.statusCode).json({
    success: false,
    data: err.details ?? null,
    message: err.message,
    stack: err.stack,
    error: err,
  });

// Unexpected (non-operational) errors never leak their message or stack in production.
const sendErrorProd = (err, res) =>
  res.status(err.statusCode).json({
    success: false,
    data: err.isOperational ? (err.details ?? null) : null,
    message: err.isOperational ? err.message : 'Something went wrong, please try again later.',
  });

// ─── Global handler ──────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  const err = normalize(error instanceof Error ? error : new Error(String(error)));
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.isOperational) {
    logger.warn(`${err.statusCode} - ${err.message} [${req.method} ${req.originalUrl}]`);
  } else {
    logger.error(err.message, { stack: err.stack, statusCode: err.statusCode, path: req.originalUrl });
  }

  if (env.isDev) sendErrorDev(err, res);
  else sendErrorProd(err, res);
};

export default errorHandler;

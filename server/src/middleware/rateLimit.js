import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';
import MongoRateLimitStore from './rateLimitStore.js';

const MINUTE = 60 * 1000;

/** `shared` = count in MongoDB across all server instances (security limits); otherwise per instance, in memory. */
const createLimiter = ({ name, windowMs, limit, message, skipSuccessfulRequests = false, skip, shared = false }) =>
  rateLimit({
    windowMs,
    limit,
    skipSuccessfulRequests,
    ...(skip && { skip }),
    ...(shared && { store: new MongoRateLimitStore(name) }),
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res, next) => next(ApiError.tooMany(message)),
  });

const isAdminPath = (req) => req.path === '/admin' || req.path.startsWith('/admin/');

// Mounted on `/api`. `/api/admin/*` uses `adminLimiter` instead: the dashboard autosaves drafts while typing.
// Broad abuse limits, kept in memory so ordinary requests do not pay a database round trip.
export const apiLimiter = createLimiter({ windowMs: 15 * MINUTE, limit: 300, skip: isAdminPath });
export const adminLimiter = createLimiter({ windowMs: 15 * MINUTE, limit: 1500 });

// For public form submissions (contact).
export const strictLimiter = createLimiter({
  name: 'strict',
  shared: true,
  windowMs: 15 * MINUTE,
  limit: 10,
  message: 'Too many attempts, please try again in 15 minutes',
});

// Admin login, per IP: 5 failed attempts per 15 minutes (successful logins don't count).
export const loginLimiter = createLimiter({
  name: 'login',
  shared: true,
  windowMs: 15 * MINUTE,
  limit: 5,
  message: 'Too many login attempts, please try again in 15 minutes',
  skipSuccessfulRequests: true,
});

// Changing the admin email or password (needs the current password), per IP: 5 failed attempts per 15 minutes.
export const accountLimiter = createLimiter({
  name: 'account',
  shared: true,
  windowMs: 15 * MINUTE,
  limit: 5,
  message: 'Too many attempts, please try again in 15 minutes',
  skipSuccessfulRequests: true,
});

// Public testimonial form, per IP. Its own counter so it never eats into the login / contact limits.
export const testimonialLimiter = createLimiter({
  name: 'testimonial',
  shared: true,
  windowMs: 15 * MINUTE,
  limit: 5,
  message: 'Too many submissions, please try again in 15 minutes',
});

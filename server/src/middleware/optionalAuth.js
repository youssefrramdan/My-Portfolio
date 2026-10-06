import logger from '../config/logger.js';
import { loadUser } from './requireAuth.js';

/** Sets `req.user` when the auth cookie is valid. Never rejects the request. */
export default async function optionalAuth(req, res, next) {
  try {
    req.user = (await loadUser(req)) ?? null;
  } catch (error) {
    logger.warn(`optionalAuth: could not load the user (${error.message})`);
    req.user = null;
  }
  next();
}

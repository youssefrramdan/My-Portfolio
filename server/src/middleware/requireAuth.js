import mongoose from 'mongoose';
import { readSession } from '../modules/auth/authCookie.js';
import User from '../modules/auth/user.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

/** A session signed before the last password change is no longer valid. */
const signedBeforePasswordChange = (session, user) =>
  Boolean(user.passwordChangedAt) && session.issuedAt < Math.floor(user.passwordChangedAt.getTime() / 1000);

/** Loads the admin from the JWT cookie into `req.user`, or `null` when the cookie is missing or invalid. */
export async function loadUser(req) {
  const session = readSession(req);
  if (!session || !mongoose.isValidObjectId(session.userId)) return null;
  const user = await User.findById(session.userId).select('email name title avatar +passwordChangedAt').lean();
  if (!user || signedBeforePasswordChange(session, user)) return null;
  const { passwordChangedAt, ...profile } = user;
  return profile;
}

/** Rejects the request with 401 unless the auth cookie belongs to an existing admin. */
const requireAuth = asyncHandler(async (req, res, next) => {
  const user = await loadUser(req);
  if (!user) throw ApiError.unauthorized('Please log in to continue');
  req.user = user;
  next();
});

export default requireAuth;

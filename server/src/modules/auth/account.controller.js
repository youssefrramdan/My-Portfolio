import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import ApiError from '../../utils/ApiError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { BCRYPT_ROUNDS, toProfile } from './auth.controller.js';
import { setAuthCookie } from './authCookie.js';
import User from './user.model.js';

const WRONG_PASSWORD = 'Current password is incorrect';
const PROFILE_FIELDS = 'email name title avatar';

/** A wrong current password is a 400 (not 401), so the dashboard does not treat it as an expired session. */
async function checkCurrentPassword(userId, password) {
  const user = await User.findById(userId).select('+passwordHash').lean();
  const matches = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!matches) throw ApiError.badRequest(WRONG_PASSWORD, [{ field: 'currentPassword', message: WRONG_PASSWORD }]);
}

/** PUT /api/admin/account/profile: name, title and photo shown in the dashboard. */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, title, avatar } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { name, title, avatar: { url: avatar?.url ?? '', publicId: avatar?.publicId ?? '', alt: avatar?.alt ?? '' } },
    { returnDocument: 'after', runValidators: true },
  )
    .select(PROFILE_FIELDS)
    .lean();
  sendSuccess(res, toProfile(user), 'Profile saved');
});

/** PUT /api/admin/account/email: the login email. Needs the current password. */
export const updateEmail = asyncHandler(async (req, res) => {
  const { email, currentPassword } = req.body;
  await checkCurrentPassword(req.user._id, currentPassword);
  // `sanitizeFilter` is on globally, so our own operator has to be marked as trusted.
  const taken = await User.exists({ email, _id: mongoose.trusted({ $ne: req.user._id }) });
  if (taken) throw ApiError.conflict('This email is already used by another account');
  const user = await User.findByIdAndUpdate(req.user._id, { email }, { returnDocument: 'after', runValidators: true })
    .select(PROFILE_FIELDS)
    .lean();
  sendSuccess(res, toProfile(user), 'Login email updated');
});

/**
 * PUT /api/admin/account/password: needs the current password. Other devices are signed out (their sessions are
 * older than `passwordChangedAt`); this one gets a fresh cookie.
 */
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await checkCurrentPassword(req.user._id, currentPassword);
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await User.updateOne({ _id: req.user._id }, { passwordHash, passwordChangedAt: new Date() });
  setAuthCookie(res, req.user._id);
  sendSuccess(res, null, 'Password updated');
});

import bcrypt from 'bcryptjs';
import ApiError from '../../utils/ApiError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { clearAuthCookie, setAuthCookie } from './authCookie.js';
import User from './user.model.js';

export const BCRYPT_ROUNDS = 12;
const INVALID_CREDENTIALS = 'Invalid email or password';

// Compared against when the email is unknown, so both failure paths cost one bcrypt compare.
const DUMMY_HASH = bcrypt.hashSync('dummy-password-for-timing', BCRYPT_ROUNDS);

/** What the dashboard may know about the admin. Never the password hash. */
export const toProfile = (user) => ({
  name: user.name,
  title: user.title,
  email: user.email,
  avatar: { url: user.avatar?.url ?? '', publicId: user.avatar?.publicId ?? '', alt: user.avatar?.alt ?? '' },
});

/** POST /api/auth/login: same error for an unknown email and a wrong password. */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash').lean();
  const matches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !matches) throw ApiError.unauthorized(INVALID_CREDENTIALS);

  setAuthCookie(res, user._id);
  sendSuccess(res, toProfile(user), 'Logged in');
});

/** POST /api/auth/logout */
export const logout = (req, res) => {
  clearAuthCookie(res);
  sendSuccess(res, null, 'Logged out');
};

/** GET /api/auth/me (requireAuth) */
export const me = (req, res) => sendSuccess(res, toProfile(req.user));

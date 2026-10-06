import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export const AUTH_COOKIE = 'admin_token';

const baseCookieOptions = () => ({
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.COOKIE_SAMESITE,
  path: '/',
});

/** Signs a JWT for the user and sets it as an httpOnly cookie that expires with the token. */
export function setAuthCookie(res, userId) {
  const token = jwt.sign({ sub: String(userId) }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  const { exp } = jwt.decode(token);
  res.cookie(AUTH_COOKIE, token, { ...baseCookieOptions(), expires: new Date(exp * 1000) });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE, baseCookieOptions());
}

/**
 * Returns `{ userId, issuedAt }` (issuedAt in seconds) from the request cookie, or `null` when it is missing, expired
 * or tampered with.
 */
export function readSession(req) {
  const token = req.cookies?.[AUTH_COOKIE];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, env.JWT_SECRET);
    return typeof payload.sub === 'string' ? { userId: payload.sub, issuedAt: payload.iat ?? 0 } : null;
  } catch {
    return null;
  }
}

import bcrypt from 'bcryptjs';
import { env } from '../../src/config/env.js';
import logger from '../../src/config/logger.js';
import { BCRYPT_ROUNDS } from '../../src/modules/auth/auth.controller.js';
import User from '../../src/modules/auth/user.model.js';

const REQUIRED = ['ADMIN_EMAIL', 'ADMIN_PASSWORD'];

/**
 * Creates the single admin from ADMIN_* env vars, or updates it in place.
 * The password is only re-hashed when it changed. Neither the password nor its hash is ever logged.
 */
export default async function seedAdmin() {
  const missing = REQUIRED.filter((key) => !env[key]);
  if (missing.length) throw new Error(`Set ${missing.join(' and ')} in server/.env to seed the admin`);

  const profile = { email: env.ADMIN_EMAIL.toLowerCase(), name: env.ADMIN_NAME ?? '', title: env.ADMIN_TITLE ?? '' };
  const existing = await User.findOne().select('+passwordHash');

  if (!existing) {
    const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, BCRYPT_ROUNDS);
    await User.create({ ...profile, passwordHash });
    logger.info('Admin account created');
  } else {
    const passwordChanged = !(await bcrypt.compare(env.ADMIN_PASSWORD, existing.passwordHash));
    existing.set(profile);
    if (passwordChanged) existing.passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, BCRYPT_ROUNDS);
    const changed = existing.isModified();
    await existing.save();
    logger.info(changed ? 'Admin account updated' : 'Admin account unchanged');
  }

  return User.countDocuments();
}

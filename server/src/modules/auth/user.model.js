import mongoose, { Schema } from 'mongoose';
import { imageSchema } from '../../utils/schemas.js';

/**
 * The single admin account (created by `npm run seed:admin`, there is no registration route).
 * `passwordHash` is never selected unless asked for explicitly with `.select('+passwordHash')`.
 * Sessions signed before `passwordChangedAt` are rejected, so changing the password signs out other devices.
 * `avatar` is the dashboard profile photo (Settings > General).
 */
const userSchema = new Schema(
  {
    email: { type: String, trim: true, lowercase: true, required: true, unique: true },
    passwordHash: { type: String, required: true, select: false },
    passwordChangedAt: { type: Date, default: null, select: false },
    name: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, default: '' },
    avatar: { type: imageSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export default mongoose.model('User', userSchema);

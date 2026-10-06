import mongoose, { Schema } from 'mongoose';
import { env } from '../../config/env.js';
import { imageSchema } from '../../utils/schemas.js';

/** Used when no SiteStatus document exists yet: open in development, closed in production. */
export const DEFAULT_IS_PUBLISHED = !env.isProd;

/** What logged-out visitors see while the site is unpublished. */
const comingSoonSchema = new Schema(
  {
    badge: { type: String, trim: true, default: '' },
    title: {
      plain: { type: String, trim: true, default: '' },
      highlight: { type: String, trim: true, default: '' },
    },
    message: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    image: { type: imageSchema, default: () => ({}) },
    showEmail: { type: Boolean, default: true },
  },
  { _id: false },
);

/** Single document. Unpublished = public content routes answer 503 for everyone but the admin. */
const siteStatusSchema = new Schema(
  {
    isPublished: { type: Boolean, default: DEFAULT_IS_PUBLISHED },
    publishedAt: { type: Date, default: null },
    comingSoon: { type: comingSoonSchema, default: () => ({}) },
  },
  { timestamps: true },
);

export default mongoose.model('SiteStatus', siteStatusSchema);

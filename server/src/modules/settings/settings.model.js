import mongoose, { Schema } from 'mongoose';
import { HEX_COLOR } from '../../../../shared/identity.js';
import { DEFAULT_BRAND_COLOR } from '../../../../shared/settings.js';
import { fileSchema, imageSchema } from '../../utils/schemas.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Search engine and link preview defaults (Settings > SEO). Project pages use their own title, summary and cover. */
const seoSchema = new Schema(
  {
    title: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    image: { type: imageSchema, default: () => ({}) },
    googleVerification: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

/**
 * Single document with site-wide data managed from the dashboard. Social links are their own collection.
 * `avatar` (the Identity "logo / mark") and `cv` are published from the Identity draft. `siteUrl` is the public
 * address used for canonical links, the sitemap and previews (empty = the server's CLIENT_URL).
 */
const settingsSchema = new Schema(
  {
    siteName: { type: String, trim: true, default: '' },
    /** The site's brand color (`--color-brand-color` on the site and the dashboard), edited in General. */
    brandColor: {
      type: String,
      trim: true,
      lowercase: true,
      match: [HEX_COLOR, 'Brand color must be a hex color like #35d0ba'],
      default: DEFAULT_BRAND_COLOR,
    },
    /** WhatsApp number for every "WhatsApp" button (international format, edited on the Contact page). */
    whatsapp: { type: String, trim: true, default: '' },
    siteUrl: { type: String, trim: true, default: '' },
    seo: { type: seoSchema, default: () => ({}) },
    favicon: { type: imageSchema, default: () => ({}) },
    avatar: { type: imageSchema, default: () => ({}) },
    cv: { type: fileSchema, default: () => ({}) },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      required: [true, 'Contact email is required'],
      match: [EMAIL, 'Contact email must be a valid email address'],
    },
    footer: {
      copyright: { type: String, trim: true, default: '' },
      backToTopLabel: { type: String, trim: true, default: '' },
    },
  },
  { timestamps: true },
);

export default mongoose.model('Settings', settingsSchema);

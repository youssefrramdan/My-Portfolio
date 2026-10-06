import { Schema } from 'mongoose';
import { IDENTITY_CTA_ACTIONS } from '../../../shared/identity.js';
import { normalizeUrl } from './url.js';

/** Cloudinary image. `publicId` ties it to its Media library entry (replaced images stay in the library). */
export const imageSchema = new Schema(
  {
    url: { type: String, trim: true, default: '' },
    publicId: { type: String, trim: true, default: '' },
    alt: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

/** Uploaded document (the resume): Cloudinary raw file plus its display name and size. */
export const fileSchema = new Schema(
  {
    url: { type: String, trim: true, default: '' },
    publicId: { type: String, trim: true, default: '' },
    name: { type: String, trim: true, default: '' },
    bytes: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

/**
 * What a call-to-action button does:
 * - `scroll`: `target` is a section id on the page
 * - `link`:   `target` is an http(s) URL, opened in a new tab
 * - `email`:    opens Gmail addressed to the Settings contact email (no target)
 * - `whatsapp`: opens a WhatsApp chat with the Settings WhatsApp number (no target)
 * - `cv`:       opens the resume uploaded in Identity (no target)
 */
export const CTA_ACTIONS = IDENTITY_CTA_ACTIONS;

/** A button the admin controls: its label and what it does. */
export const ctaSchema = new Schema(
  {
    label: { type: String, trim: true, required: [true, 'Button label is required'] },
    action: { type: String, enum: CTA_ACTIONS, required: [true, 'Button action is required'] },
    target: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

ctaSchema.pre('validate', function normalizeTarget() {
  if (this.action === 'link') this.target = normalizeUrl(this.target);
  if (this.action === 'scroll') this.target = this.target.replace(/^#/, '');
  if (!['link', 'scroll'].includes(this.action)) this.target = '';
});

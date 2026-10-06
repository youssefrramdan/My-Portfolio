import mongoose, { Schema } from 'mongoose';
import { DEFAULT_LINK_LABEL, GALLERY_LAYOUTS, WORK_STATUSES } from '../../../../shared/work.js';
import { imageSchema } from '../../utils/schemas.js';

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "Gadora — Real Estate" -> "gadora-real-estate" */
export const slugify = (text) =>
  String(text)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const galleryImageSchema = new Schema(
  {
    url: { type: String, trim: true, required: true },
    publicId: { type: String, trim: true, default: '' },
    alt: { type: String, trim: true, default: '' },
    layout: { type: String, enum: GALLERY_LAYOUTS, default: 'full' },
  },
  { _id: false },
);

/**
 * One Work item. The top-level content fields are the live version (what the site shows once `status` is
 * `published`); `draft` holds unpublished edits in the dashboard shape (see projects.service.js `normalizeWork`),
 * `null` when there is nothing to publish. Required content is checked on publish, so a new item can start empty.
 * `slug` is set from the title on the first publish and then stays fixed so shared links keep working.
 * `featured` items appear in the home "Selected Projects" section; every published item has its own page.
 */
const projectSchema = new Schema(
  {
    slug: { type: String, trim: true, lowercase: true, unique: true, sparse: true, match: SLUG_PATTERN },
    status: { type: String, enum: WORK_STATUSES, default: 'draft' },
    title: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    coverImage: { type: imageSchema, default: () => ({}) },
    year: { type: Number, default: null },
    role: { type: String, trim: true, default: '' },
    client: { type: String, trim: true, default: '' },
    externalLink: { type: String, trim: true, default: '' },
    linkLabel: { type: String, trim: true, default: DEFAULT_LINK_LABEL },
    /** Card link text for this project; empty = the section's `cardCtaLabel`. */
    cardLabel: { type: String, trim: true, default: '' },
    featured: { type: Boolean, default: true },
    tags: { type: [String], default: [] },
    gallery: { type: [galleryImageSchema], default: [] },
    draft: { type: Schema.Types.Mixed, default: null },
    order: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true, minimize: false },
);

export default mongoose.model('Project', projectSchema);

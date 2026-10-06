import mongoose, { Schema } from 'mongoose';
import { TESTIMONIAL_SOURCE, TESTIMONIAL_STATUS } from '../../../../shared/testimonials.js';
import { imageSchema } from '../../utils/schemas.js';

/**
 * One testimonial card. Works like a Work item: the top-level content is the live version, `draft` holds the
 * content that is not live yet (testimonials.service.js `normalizeTestimonial` shape, `null` when there is nothing
 * to publish). A visitor's submission is stored as a `pending` draft and goes live when the admin approves
 * (publishes) it. Without an avatar the site shows the first letter of the name.
 */
const testimonialSchema = new Schema(
  {
    status: { type: String, enum: TESTIMONIAL_STATUS, default: 'draft', index: true },
    source: { type: String, enum: TESTIMONIAL_SOURCE, default: 'admin' },
    name: { type: String, trim: true, default: '' },
    role: { type: String, trim: true, default: '' },
    message: { type: String, trim: true, default: '' },
    avatar: { type: imageSchema, default: () => ({}) },
    draft: { type: Schema.Types.Mixed, default: null },
    order: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true, minimize: false },
);

export default mongoose.model('Testimonial', testimonialSchema);

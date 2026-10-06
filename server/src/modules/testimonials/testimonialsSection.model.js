import mongoose, { Schema } from 'mongoose';

/**
 * Single document: the "What People Say." heading (`highlight` renders in green, `description` is an optional line
 * under it) and the "Worked with me before?" block under the cards, whose button opens the testimonial form.
 */
const testimonialsSectionSchema = new Schema(
  {
    badge: { type: String, trim: true, default: '' },
    title: {
      plain: { type: String, trim: true, default: '' },
      highlight: { type: String, trim: true, default: '' },
    },
    description: { type: String, trim: true, default: '' },
    ctaHeading: { type: String, trim: true, default: '' },
    ctaDescription: { type: String, trim: true, default: '' },
    ctaButtonLabel: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('TestimonialsSection', testimonialsSectionSchema);

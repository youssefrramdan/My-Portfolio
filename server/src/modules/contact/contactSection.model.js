import mongoose, { Schema } from 'mongoose';
import { ctaSchema } from '../../utils/schemas.js';

/**
 * Single document: the "Let's Build Something." block (`highlight` renders in green) and its two buttons.
 * The social icons on the arc come from the settings' social links.
 */
const contactSectionSchema = new Schema(
  {
    badge: { type: String, trim: true, default: '' },
    title: {
      plain: { type: String, trim: true, default: '' },
      highlight: { type: String, trim: true, default: '' },
    },
    description: { type: String, trim: true, default: '' },
    primaryCta: { type: ctaSchema, default: undefined },
    secondaryCta: { type: ctaSchema, default: undefined },
  },
  { timestamps: true },
);

export default mongoose.model('ContactSection', contactSectionSchema);

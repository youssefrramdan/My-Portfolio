import mongoose, { Schema } from 'mongoose';

/**
 * Single document: the "Tools & Methods" heading. The title is split so `highlight` renders in green; `description`
 * is an optional line under it.
 */
const skillsSectionSchema = new Schema(
  {
    badge: { type: String, trim: true, default: '' },
    title: {
      plain: { type: String, trim: true, default: '' },
      highlight: { type: String, trim: true, default: '' },
    },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('SkillsSection', skillsSectionSchema);

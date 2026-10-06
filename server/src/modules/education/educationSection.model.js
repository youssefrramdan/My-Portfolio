import mongoose, { Schema } from 'mongoose';

/**
 * Single document: the "Education & Learning" heading (`highlight` renders in green), an optional line under it
 * and the heading of the certificates card.
 */
const educationSectionSchema = new Schema(
  {
    badge: { type: String, trim: true, default: '' },
    title: {
      plain: { type: String, trim: true, default: '' },
      highlight: { type: String, trim: true, default: '' },
    },
    description: { type: String, trim: true, default: '' },
    certificatesTitle: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('EducationSection', educationSectionSchema);

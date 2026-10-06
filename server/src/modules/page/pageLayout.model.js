import mongoose, { Schema } from 'mongoose';
import { completeSections, findKeyProblem, SECTION_KEYS } from './page.sections.js';

const sectionSchema = new Schema(
  {
    key: { type: String, enum: SECTION_KEYS, required: true },
    isVisible: { type: Boolean, default: true },
    navLabel: { type: String, trim: true, default: '' },
    order: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

/**
 * Single document: order, visibility and navbar labels of the home page sections. Always holds every key exactly
 * once.
 */
const pageLayoutSchema = new Schema(
  {
    sections: {
      type: [sectionSchema],
      default: () => completeSections(),
      validate: {
        validator: (sections) => !findKeyProblem(sections.map((section) => section.key)),
        message: (props) => findKeyProblem(props.value.map((section) => section.key)),
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model('PageLayout', pageLayoutSchema);

import mongoose, { Schema } from 'mongoose';
import { DEFAULT_PAGE_BUTTONS, MAX_PAGE_BUTTONS } from '../../../../shared/work.js';
import { ctaSchema } from '../../utils/schemas.js';

export const DEFAULT_CARD_CTA_LABEL = 'View Case Study';

/**
 * Single document: the "Selected Projects" heading. The title is split so `highlight` renders in green.
 * `cardCtaLabel` is the default link text on project cards (the card opens the project page); `pageButtons` are
 * the floating buttons on every project page.
 */
const projectsSectionSchema = new Schema(
  {
    badge: { type: String, trim: true, required: true },
    title: {
      plain: { type: String, trim: true, required: true },
      highlight: { type: String, trim: true, default: '' },
    },
    description: { type: String, trim: true, default: '' },
    scrollButtonLabel: { type: String, trim: true, default: '' },
    cardCtaLabel: { type: String, trim: true, default: DEFAULT_CARD_CTA_LABEL },
    pageButtons: {
      type: [ctaSchema],
      default: () => DEFAULT_PAGE_BUTTONS.map((button) => ({ ...button })),
      validate: {
        validator: (buttons) => buttons.length <= MAX_PAGE_BUTTONS,
        message: `At most ${MAX_PAGE_BUTTONS} project page buttons`,
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model('ProjectsSection', projectsSectionSchema);

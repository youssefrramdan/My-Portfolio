import mongoose, { Schema } from 'mongoose';
import { HEX_COLOR, IDENTITY_LIMITS, IMAGE_INTERVAL, PHOTO_CURSOR } from '../../../../shared/identity.js';
import { ctaSchema, imageSchema } from '../../utils/schemas.js';

/** A skill in the cycling column next to the photo. */
const skillTagSchema = new Schema(
  {
    label: { type: String, trim: true, required: true },
    icon: { type: String, trim: true, required: true }, // lucide "pen-tool" or Hugeicons "PenTool01Icon" (shared/icons.js)
    iconNodes: { type: Schema.Types.Mixed, default: () => [] }, // the Hugeicons drawing, empty for lucide names
  },
  { _id: false },
);

/** A stat card, e.g. label "Total" (optional pill), number 15, suffix "+", title "Project Delivered". */
const statSchema = new Schema(
  {
    label: { type: String, trim: true, default: '' },
    number: { type: Number, required: true, min: 0 },
    suffix: { type: String, trim: true, default: '' },
    title: { type: String, trim: true, required: true },
  },
  { _id: false },
);

/** Points after a title word. `occurrence` tells repeated words apart (0 = first time the word appears). */
const anchorFields = {
  word: { type: String, trim: true, required: true },
  occurrence: { type: Number, min: 0, default: 0 },
};

const lineBreakSchema = new Schema(anchorFields, { _id: false });

/** Rotating images shown right after a title word. */
const imageSlotSchema = new Schema({ ...anchorFields, images: { type: [imageSchema], default: [] } }, { _id: false });

/**
 * Single document: the published hero. The dashboard edits a draft (IdentityDraft) and copies it here on publish.
 * `backgroundText` is the Identity "display name", `intro` the "description". Array order is the display order.
 */
const heroSchema = new Schema(
  {
    role: { type: String, trim: true, required: true },
    title: { type: String, trim: true, default: '' },
    intro: { type: String, trim: true, default: '' },
    photo: { type: imageSchema, default: () => ({}) },
    backgroundText: { type: String, trim: true, default: '' },
    /** Figma-style cursor shown over the photo; hidden while `label` is empty. */
    photoCursor: {
      label: { type: String, trim: true, default: '', maxlength: IDENTITY_LIMITS.cursorLabel },
      color: { type: String, trim: true, match: HEX_COLOR, default: PHOTO_CURSOR.color },
      background: { type: String, trim: true, match: HEX_COLOR, default: PHOTO_CURSOR.background },
    },
    headline: {
      lineBreak: { type: lineBreakSchema, default: null },
      imageSlots: {
        type: [imageSlotSchema],
        default: [],
        validate: {
          validator: (slots) => slots.length <= IDENTITY_LIMITS.imageSlots,
          message: `At most ${IDENTITY_LIMITS.imageSlots} image spots`,
        },
      },
      /** Seconds before each spot shows its next image. */
      interval: { type: Number, min: IMAGE_INTERVAL.min, max: IMAGE_INTERVAL.max, default: IMAGE_INTERVAL.default },
    },
    showSkillTags: { type: Boolean, default: true },
    skillTags: { type: [skillTagSchema], default: [] },
    showStats: { type: Boolean, default: true },
    stats: {
      type: [statSchema],
      default: [],
      validate: {
        validator: (stats) => stats.length <= IDENTITY_LIMITS.stats,
        message: `At most ${IDENTITY_LIMITS.stats} highlights`,
      },
    },
    ctaPrimary: { type: ctaSchema, default: undefined },
    ctaSecondary: { type: ctaSchema, default: undefined },
  },
  { timestamps: true },
);

export default mongoose.model('Hero', heroSchema);

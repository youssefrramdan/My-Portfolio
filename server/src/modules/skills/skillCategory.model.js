import mongoose, { Schema } from 'mongoose';
import { CONTENT_STATUSES } from '../../../../shared/content.js';
import { imageSchema } from '../../utils/schemas.js';

/**
 * One Capabilities group (a card of the "Tools & Methods" section), e.g. "Design Tools" with chips
 * ["Figma", "Lottie", ...]. Chip order is the array order. Works like a Work item: the top-level content is the
 * live version, `draft` holds unpublished edits (skills.service.js `normalizeGroup` shape, `null` when there is
 * nothing to publish). At most four groups are published at once (one per card slot).
 */
const skillCategorySchema = new Schema(
  {
    status: { type: String, enum: CONTENT_STATUSES, default: 'draft' },
    title: { type: String, trim: true, default: '' },
    icon: { type: imageSchema, default: () => ({}) },
    /** Hugeicons icon `{ name, nodes }` (shared/icons.js); shown instead of `icon` when set. */
    glyph: {
      name: { type: String, trim: true, default: '' },
      nodes: { type: Schema.Types.Mixed, default: () => [] },
    },
    items: { type: [{ type: String, trim: true }], default: [] },
    draft: { type: Schema.Types.Mixed, default: null },
    order: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true, minimize: false },
);

export default mongoose.model('SkillCategory', skillCategorySchema);

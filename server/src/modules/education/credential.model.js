import mongoose, { Schema } from 'mongoose';
import { CONTENT_STATUSES } from '../../../../shared/content.js';
import { CREDENTIAL_KINDS } from '../../../../shared/credentials.js';
import { imageSchema } from '../../utils/schemas.js';

/**
 * One Credentials item: a degree or diploma (`education`), certificate, award or publication. `date` is free text
 * ("2025", "October 2024"). `detail`, `subjects`, `label` (the pill: "Degree", "IT Diploma") and `image` are used
 * by `education` items: the side card shows the image when there is one, else the graduation year + `detail`.
 * Works like a Work item: the top-level content is the live version, `draft` holds unpublished edits
 * (education.service.js `normalizeCredential` shape, `null` when there is nothing to publish).
 */
const credentialSchema = new Schema(
  {
    status: { type: String, enum: CONTENT_STATUSES, default: 'draft' },
    kind: { type: String, enum: CREDENTIAL_KINDS, default: 'certificate' },
    title: { type: String, trim: true, default: '' },
    issuer: { type: String, trim: true, default: '' },
    date: { type: String, trim: true, default: '' },
    link: { type: String, trim: true, default: '' },
    detail: { type: String, trim: true, default: '' },
    subjects: { type: [{ type: String, trim: true }], default: [] },
    label: { type: String, trim: true, default: '' },
    image: { type: imageSchema, default: () => ({}) },
    draft: { type: Schema.Types.Mixed, default: null },
    order: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true, minimize: false },
);

export default mongoose.model('Credential', credentialSchema);

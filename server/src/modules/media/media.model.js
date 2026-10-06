import mongoose, { Schema } from 'mongoose';
import { MEDIA_KINDS } from '../../../../shared/identity.js';

/**
 * One uploaded Cloudinary asset. `kind`: `image` (jpg / png / webp / gif) or `file` (PDF, stored as raw).
 * `folder` null = Unsorted.
 */
const mediaSchema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    folder: { type: Schema.Types.ObjectId, ref: 'MediaFolder', default: null },
    url: { type: String, trim: true, required: true },
    publicId: { type: String, trim: true, required: true, unique: true },
    kind: { type: String, enum: MEDIA_KINDS, required: true },
    format: { type: String, trim: true, default: '' },
    bytes: { type: Number, min: 0, default: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
  },
  { timestamps: true },
);

mediaSchema.index({ kind: 1, createdAt: -1 });
mediaSchema.index({ folder: 1, kind: 1, createdAt: -1 });

export default mongoose.model('Media', mediaSchema);

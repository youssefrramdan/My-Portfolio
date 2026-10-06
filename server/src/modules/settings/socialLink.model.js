import mongoose, { Schema } from 'mongoose';
import { isHttpUrl, normalizeUrl } from '../../utils/url.js';
import { PLATFORM_KEYS } from './socialPlatforms.js';

/** One icon on the Contact arc. One document per platform; `order` is the display order. */
const socialLinkSchema = new Schema(
  {
    platform: { type: String, enum: PLATFORM_KEYS, required: [true, 'Platform is required'], unique: true },
    url: {
      type: String,
      trim: true,
      required: [true, 'Link is required'],
      set: normalizeUrl,
      validate: { validator: isHttpUrl, message: 'Link must be a valid http(s) URL' },
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.model('SocialLink', socialLinkSchema);

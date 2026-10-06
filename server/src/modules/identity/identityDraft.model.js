import mongoose, { Schema } from 'mongoose';

/**
 * Single document: unpublished Identity edits. `data` has the dashboard shape (see identity.service.js
 * `normalizeIdentity`) and is validated by identity.validator.js before it is saved. No document = nothing
 * to publish. Publishing copies it into Hero + Settings and deletes it.
 */
const identityDraftSchema = new Schema(
  {
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false },
);

export default mongoose.model('IdentityDraft', identityDraftSchema);

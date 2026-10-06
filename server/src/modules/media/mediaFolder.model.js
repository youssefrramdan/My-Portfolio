import mongoose, { Schema } from 'mongoose';
import { folderNameKey, MEDIA_FOLDER_LIMITS } from '../../../../shared/media.js';

/** A media library folder. `parent` null = top level. `nameKey` keeps sibling names unique, ignoring case. */
const mediaFolderSchema = new Schema(
  {
    name: { type: String, trim: true, required: true, maxlength: MEDIA_FOLDER_LIMITS.name },
    nameKey: { type: String, required: true },
    parent: { type: Schema.Types.ObjectId, ref: 'MediaFolder', default: null },
  },
  { timestamps: true },
);

mediaFolderSchema.index({ parent: 1, nameKey: 1 }, { unique: true });

mediaFolderSchema.pre('validate', function setNameKey() {
  this.nameKey = folderNameKey(this.name);
});

export default mongoose.model('MediaFolder', mediaFolderSchema);

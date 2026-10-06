import mongoose from 'mongoose';
import {
  ALL_MEDIA,
  descendantIds,
  folderNameKey,
  folderPath,
  MEDIA_FOLDER_LIMITS as LIMITS,
  subtreeDepth,
  UNSORTED_MEDIA,
} from '../../../../shared/media.js';
import ApiError from '../../utils/ApiError.js';
import Media from './media.model.js';
import MediaFolder from './mediaFolder.model.js';

const FOLDER_FIELDS = '_id name parent';
const DUPLICATE_KEY = 11000;

const allFolders = () => MediaFolder.find().sort({ nameKey: 1 }).select(FOLDER_FIELDS).lean();
const sameId = (a, b) => String(a ?? '') === String(b ?? '');

async function findFolder(id, message = 'Folder not found') {
  const folder = await MediaFolder.findById(id);
  if (!folder) throw ApiError.notFound(message);
  return folder;
}

function assertFreeName(folders, parent, name, exceptId) {
  const key = folderNameKey(name);
  const taken = folders.some((folder) => sameId(folder.parent, parent) && !sameId(folder._id, exceptId) && folderNameKey(folder.name) === key);
  if (taken) throw ApiError.conflict('A folder with this name already exists here.');
}

function assertRoom(folders, parent) {
  if (folders.filter((folder) => sameId(folder.parent, parent)).length >= LIMITS.perParent) {
    throw ApiError.badRequest(`A folder can hold up to ${LIMITS.perParent} folders.`);
  }
}

/** "Logos" -> "Logos (2)" (or the next free number) when the name is taken among the siblings. */
function freeName(takenKeys, name) {
  if (!takenKeys.has(folderNameKey(name))) return name;
  for (let n = 2; ; n += 1) {
    const suffix = ` (${n})`;
    const candidate = `${name.slice(0, LIMITS.name - suffix.length)}${suffix}`;
    if (!takenKeys.has(folderNameKey(candidate))) return candidate;
  }
}

const rethrowDuplicate = (error) => {
  if (error?.code === DUPLICATE_KEY) throw ApiError.conflict('A folder with this name already exists here.');
  throw error;
};

/** Every folder with its number of `kind` items (direct only), plus the Unsorted and total counts. */
export async function listFolders(kind) {
  const [folders, counts] = await Promise.all([
    allFolders(),
    Media.aggregate([{ $match: kind ? { kind } : {} }, { $group: { _id: { $ifNull: ['$folder', null] }, count: { $sum: 1 } } }]),
  ]);
  const countOf = new Map(counts.map((entry) => [String(entry._id), entry.count]));
  return {
    folders: folders.map((folder) => ({ ...folder, count: countOf.get(String(folder._id)) ?? 0 })),
    unsorted: countOf.get('null') ?? 0,
    total: counts.reduce((sum, entry) => sum + entry.count, 0),
  };
}

export async function createFolder({ name, parent = null }) {
  const folders = await allFolders();
  if (parent) {
    if (!folders.some((folder) => sameId(folder._id, parent))) throw ApiError.notFound('Parent folder not found');
    if (folderPath(folders, parent).length >= LIMITS.depth) {
      throw ApiError.badRequest(`Folders can be nested up to ${LIMITS.depth} levels.`);
    }
  }
  assertRoom(folders, parent);
  assertFreeName(folders, parent, name);
  const folder = await MediaFolder.create({ name, parent }).catch(rethrowDuplicate);
  return { _id: folder._id, name: folder.name, parent: folder.parent, count: 0 };
}

/** Rename and / or move a folder (with everything inside it). A folder cannot go inside itself. */
export async function updateFolder(id, changes) {
  const folder = await findFolder(id);
  const folders = await allFolders();
  const name = changes.name ?? folder.name;
  const parent = 'parent' in changes ? (changes.parent ?? null) : folder.parent;

  if (!sameId(parent, folder.parent)) {
    if (parent) {
      if (sameId(parent, id) || descendantIds(folders, id).includes(String(parent))) {
        throw ApiError.badRequest('A folder cannot be moved inside itself.');
      }
      if (!folders.some((candidate) => sameId(candidate._id, parent))) throw ApiError.notFound('Parent folder not found');
    }
    const depth = (parent ? folderPath(folders, parent).length : 0) + subtreeDepth(folders, id);
    if (depth > LIMITS.depth) throw ApiError.badRequest(`Folders can be nested up to ${LIMITS.depth} levels.`);
    assertRoom(folders, parent);
  }
  assertFreeName(folders, parent, name, id);

  folder.name = name;
  folder.parent = parent;
  await folder.save().catch(rethrowDuplicate);
  return { _id: folder._id, name: folder.name, parent: folder.parent };
}

/**
 * Deletes a folder. Its items and subfolders move up to its parent (a subfolder whose name is taken there gets
 * a number). Library items and Cloudinary assets are never deleted here.
 */
export async function deleteFolder(id) {
  const folder = await findFolder(id);
  const parent = folder.parent;
  const [siblings, children] = await Promise.all([
    MediaFolder.find({ parent, _id: mongoose.trusted({ $ne: folder._id }) }).select('nameKey').lean(),
    MediaFolder.find({ parent: folder._id }),
  ]);
  const takenKeys = new Set(siblings.map((sibling) => sibling.nameKey));

  for (const child of children) {
    child.name = freeName(takenKeys, child.name);
    child.parent = parent;
    takenKeys.add(folderNameKey(child.name));
    await child.save();
  }
  const { modifiedCount } = await Media.updateMany({ folder: folder._id }, { folder: parent });
  await folder.deleteOne();
  return { movedTo: parent, items: modifiedCount, folders: children.length };
}

/** Moves library items into `folder` (null = Unsorted). */
export async function moveMedia(ids, folder = null) {
  if (folder) await findFolder(folder);
  const { modifiedCount } = await Media.updateMany({ _id: mongoose.trusted({ $in: ids }) }, { folder });
  return { moved: modifiedCount, folder };
}

/** Upload target: an existing folder id, or null. */
export async function uploadFolder(folder) {
  if (!folder) return null;
  return (await findFolder(folder)).id;
}

/**
 * Mongo filter for the media list `folder` value: `all` (default) = everything, `none` = Unsorted, an id = that
 * folder's items, or, while searching, the folder and everything inside it.
 */
export async function folderFilter(folder, search) {
  if (!folder || folder === ALL_MEDIA) return {};
  if (folder === UNSORTED_MEDIA) return { folder: null };
  if (!search) return { folder };
  const folders = await MediaFolder.find().select('_id parent').lean();
  return { folder: mongoose.trusted({ $in: [folder, ...descendantIds(folders, folder)] }) };
}

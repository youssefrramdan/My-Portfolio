/**
 * Media library folders. Folders nest up to `depth` levels; an item sits in one folder or in none ("Unsorted").
 * Deleting a folder moves its items and subfolders up to its parent, so nothing is lost.
 */
export const MEDIA_FOLDER_LIMITS = { name: 40, depth: 3, perParent: 50, moveBatch: 100 };

/** `folder` filter values of the media list besides a folder id. */
export const ALL_MEDIA = 'all';
export const UNSORTED_MEDIA = 'none';

/** Case-insensitive key that keeps sibling folder names unique. */
export const folderNameKey = (name = '') => String(name).trim().toLowerCase();

/** Folders from the root down to `id` (inclusive), or [] for no / unknown folder. */
export function folderPath(folders, id) {
  const byId = new Map(folders.map((folder) => [String(folder._id), folder]));
  const path = [];
  let current = id ? byId.get(String(id)) : null;
  while (current && path.length <= MEDIA_FOLDER_LIMITS.depth) {
    path.unshift(current);
    current = current.parent ? byId.get(String(current.parent)) : null;
  }
  return path;
}

/** Ids of every folder inside `id` (any level, not `id` itself). */
export function descendantIds(folders, id) {
  const result = [];
  let level = [String(id)];
  while (level.length) {
    const children = folders.filter((folder) => folder.parent && level.includes(String(folder.parent))).map((folder) => String(folder._id));
    result.push(...children);
    level = children;
  }
  return result;
}

/** Number of levels below `id`, counting `id` (a folder without subfolders = 1). */
export function subtreeDepth(folders, id) {
  const children = folders.filter((folder) => String(folder.parent) === String(id));
  return 1 + Math.max(0, ...children.map((child) => subtreeDepth(folders, child._id)));
}

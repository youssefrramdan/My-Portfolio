import { ALL_MEDIA, folderPath, MEDIA_FOLDER_LIMITS, UNSORTED_MEDIA } from '@shared/media';

const sameId = (a, b) => String(a ?? '') === String(b ?? '');

/** Direct subfolders of `parent` (null = top level), already sorted by name by the API. */
export const childrenOf = (folders, parent) => folders.filter((folder) => sameId(folder.parent, parent));

/** Depth-first list of `{ folder, depth }` for indented folder lists. */
export function flattenFolders(folders, parent = null, depth = 0) {
  return childrenOf(folders, parent).flatMap((folder) => [{ folder, depth }, ...flattenFolders(folders, folder._id, depth + 1)]);
}

/** A new folder can go inside `id` (null = top level) without passing the nesting limit. */
export const canNestIn = (folders, id) => !id || folderPath(folders, id).length < MEDIA_FOLDER_LIMITS.depth;

export const isFolderPlace = (place) => place !== ALL_MEDIA && place !== UNSORTED_MEDIA;

/** Display name of a place: All media, Unsorted or the folder name. */
export function placeName(folders, place, labels) {
  if (place === UNSORTED_MEDIA) return labels.unsorted;
  if (place === ALL_MEDIA) return labels.all;
  return folders.find((folder) => sameId(folder._id, place))?.name ?? labels.all;
}

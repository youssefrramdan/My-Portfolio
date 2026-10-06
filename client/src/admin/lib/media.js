/** Copy of the "Choose media" dialog and the upload checks, shared by every editor that picks media. */
export const MEDIA_LABELS = {
  title: { image: 'Choose an image', file: 'Choose a PDF' },
  description: 'Pick a file from your media library or upload a new one.',
  descriptionMany: (max) => `Pick up to ${max} images from your media library or upload new ones.`,
  search: 'Search by name',
  upload: 'Upload new',
  uploading: (progress) => `Uploading ${progress}%`,
  close: 'Close',
  cancel: 'Cancel',
  confirm: 'Use selected',
  selectedCount: (count, max) => `${count} of ${max} selected`,
  pick: (name) => `Select ${name}`,
  empty: { image: 'No images in your library yet. Upload one to get started.', file: 'No PDFs in your library yet.' },
  noResults: 'Nothing matches your search.',
  loadError: 'Could not load your media library.',
  searchIn: (place) => `Search in ${place}`,
  folders: {
    label: 'Folders',
    path: 'Folder path',
    all: 'All media',
    unsorted: 'Unsorted',
    topLevel: 'Top level',
    newFolder: 'New folder',
    newInside: 'New folder inside',
    namePlaceholder: 'Folder name',
    nameLabel: (place) => `New folder in ${place}`,
    renameLabel: (name) => `Rename ${name}`,
    create: 'Create',
    save: 'Save',
    cancel: 'Cancel',
    rename: 'Rename',
    move: 'Move to…',
    delete: 'Delete folder',
    deleteText: (name, parent) =>
      parent
        ? `Delete "${name}"? Its images and folders move to "${parent}". No image is deleted.`
        : `Delete "${name}"? Its images move to Unsorted and its folders to the top level. No image is deleted.`,
    deleting: 'Deleting…',
    menu: (name) => `Options for ${name}`,
    open: (name) => `Open ${name}`,
    expand: (name) => `Show folders in ${name}`,
    collapse: (name) => `Hide folders in ${name}`,
    count: (count) => `${count} ${count === 1 ? 'item' : 'items'}`,
    depthLimit: (levels) => `Folders can be nested up to ${levels} levels.`,
    nameTooLong: (max) => `Up to ${max} characters.`,
    emptyFolder: 'This folder is empty. Upload here or move images in.',
    error: 'Something went wrong. Try again.',
  },
  moveSelected: (count) => `Move ${count} to…`,
  moveTitle: 'Move to',
  moved: (count, place) => `Moved ${count} to ${place}.`,
  fileErrors: {
    type: 'Only JPG, PNG, WebP and GIF images or PDF files can be uploaded.',
    size: (mb) => `Files can be up to ${mb} MB.`,
    failed: 'Upload failed. Check your connection and try again.',
  },
};

/** Media library item -> the `{ url, publicId, alt }` image stored in content. */
export const libraryImage = (item, alt = '') => ({ url: item.url, publicId: item.publicId, alt });

/** Media library item -> the `{ url, publicId, name, bytes }` file stored in content. */
export const libraryFile = (item) => ({ url: item.url, publicId: item.publicId, name: item.name, bytes: item.bytes ?? 0 });

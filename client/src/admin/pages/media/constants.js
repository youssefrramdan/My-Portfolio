import { MEDIA_LABELS } from '../../lib/media';

/** `/admin/media`: the whole media library. */
export const MEDIA_PAGE = {
  eyebrow: 'Library',
  title: 'Media',
  subtitle: 'Every image and PDF you uploaded. Organize them in folders, upload new ones and delete what the site no longer uses.',
  kindsLabel: 'File type',
  kinds: { image: 'Images', file: 'PDFs' },
  count: (count) => `${count} ${count === 1 ? 'file' : 'files'}`,
  browser: {
    ...MEDIA_LABELS,
    selectedCount: (count) => (count ? `${count} selected` : 'Select files to move, copy or delete them.'),
  },
  copyLink: 'Copy link',
  copied: 'Link copied',
  copyFailed: 'Could not copy',
  open: 'Open',
  delete: {
    action: (count) => (count === 1 ? 'Delete' : `Delete ${count}`),
    title: (count) => (count === 1 ? 'Delete this file?' : `Delete ${count} files?`),
    description: 'They are removed from your library and from Cloudinary. This cannot be undone.',
    confirm: 'Delete',
    pending: 'Deleting…',
    cancel: 'Cancel',
    done: (count) => (count === 1 ? 'File deleted.' : `${count} files deleted.`),
    inUse: 'Still used on your site, so nothing was deleted. Replace or remove them there first:',
    usedIn: (places) => `Used in ${places.join(', ')}`,
    error: 'Could not delete. Try again.',
  },
};

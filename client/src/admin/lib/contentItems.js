import { REORDER_LABELS } from './reorder';

/**
 * Shared by the content modules that work like Work items (Capabilities, Credentials, Testimonials): each item has
 * a live version and a draft, and is published / unpublished / discarded from its editor.
 */
export const CONTENT_STATUS = {
  pending: 'Pending review',
  published: 'Published',
  draft: 'Draft',
  changes: 'Unpublished changes',
};

/** Admin item -> `pending` | `published` | `changes` | `draft`. */
export const contentStatusOf = (item) =>
  item.status === 'pending' ? 'pending' : item.isLive ? (item.changes.length ? 'changes' : 'published') : 'draft';

export const tooLong = (max) => `Use ${max} characters or fewer`;

/** Same idea as the server's `normalizeUrl` + `isHttpUrl`: "example.com" is fine, "example" is not. */
export function isUrlLike(value) {
  const url = value.trim();
  try {
    const { protocol, hostname } = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(url) ? url : `https://${url}`);
    return (protocol === 'http:' || protocol === 'https:') && hostname.includes('.');
  } catch {
    return false;
  }
}

export const EMAIL_LIKE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** List page copy shared by the modules (`noun` = "group", `plural` = "groups"). */
export const listCopy = ({ noun, plural }) => ({
  eyebrow: 'Content library',
  adding: 'Creating…',
  addError: `Could not create a new ${noun}. Please try again.`,
  results: (count) => `${count} ${count === 1 ? noun : plural}`,
  edit: (title) => `Edit ${title}`,
  move: (title) => `Reorder ${title}`,
  searching: `Clear the search to reorder ${plural}.`,
  orderError: 'Could not save the new order. It was put back.',
  error: {
    title: `Could not load your ${plural}`,
    message: 'Something went wrong while loading the library.',
    retry: 'Try again',
  },
  ...REORDER_LABELS,
});

/**
 * Editor copy shared by the modules (same shape as the Work editor copy). `noun` = "group", `back` = the back link,
 * `deleteLabel` = the danger link, `deleteText(title)` = what deleting removes, `fields` = names of the changed
 * fields in the status card.
 */
export const editorCopy = ({ noun, back, deleteLabel, deleteText, fields, hintTitle }) => ({
  back,
  notFound: {
    title: `This ${noun} does not exist`,
    message: 'It may have been deleted. Go back to the list to pick another one.',
  },
  error: { title: `Could not load this ${noun}`, message: 'Something went wrong while loading it.', retry: 'Try again' },
  save: {
    saved: 'All changes saved',
    saving: 'Saving…',
    invalid: 'Fix the highlighted fields to save',
    error: 'Could not save',
    retry: 'Retry',
    leaveWarning: 'Your latest changes are not saved yet.',
  },
  publish: {
    first: 'Publish item',
    changes: 'Publish changes',
    upToDate: 'Published',
    publishing: 'Publishing…',
    waiting: 'Waiting for your draft to save…',
    error: `Could not publish this ${noun}.`,
  },
  status: {
    eyebrow: 'Item status',
    draft: 'Draft',
    pending: 'Pending review',
    published: 'Published',
    changes: 'Published · unpublished changes',
    draftText: 'Published items can appear in a bound Page section. Drafts are visible only in your preview.',
    publishedText: 'This item is live. Edits stay in your draft until you publish them.',
    changesText: (count) => `${count} unpublished ${count === 1 ? 'change' : 'changes'}. Visitors see the published version.`,
    unpublish: 'Unpublish',
    unpublishing: 'Unpublishing…',
    unpublishTitle: `Unpublish this ${noun}?`,
    unpublishText: 'It disappears from the site. Your content stays here.',
    unpublishError: `Could not unpublish this ${noun}. Please try again.`,
    discard: 'Discard changes',
    discardTitle: 'Discard your changes?',
    discardText: 'Your draft goes back to the version that is live on the site. This cannot be undone.',
    discarding: 'Discarding…',
    discardError: 'Could not discard your changes. Please try again.',
    cancel: 'Keep editing',
    justPublished: `Published. Your site now shows this ${noun}.`,
  },
  fields,
  remove: {
    action: 'Action',
    label: deleteLabel,
    title: `Delete this ${noun}?`,
    text: deleteText,
    confirm: 'Delete',
    deleting: 'Deleting…',
    error: `Could not delete this ${noun}. Please try again.`,
    cancel: 'Cancel',
  },
  hint: {
    title: hintTitle,
    text: 'This editor autosaves. Publish when the required fields and connected media are ready.',
  },
});

/** "Main Details" copy shared by the modules; `extra` adds the module's own fields. */
export const mainDetailsCopy = ({ description, badge, title, subtitle, ...extra }) => ({
  title: 'Main Details',
  description,
  badge: { label: 'Eyebrow', optional: 'Optional', placeholder: badge },
  heading: { label: 'Title', placeholder: title },
  highlight: {
    label: 'Highlight:',
    hint: 'Click a word to start the green highlight there. Click the first green word to remove it.',
    word: (word, on) => `${word}${on ? ', highlighted' : ''}`,
  },
  subtitle: { label: 'Subtitle / description', optional: 'Optional', placeholder: subtitle },
  save: 'Save changes',
  saving: 'Saving…',
  saved: 'Saved. The home page shows the new heading.',
  saveError: 'Could not save the heading. Please try again.',
  loadError: 'Could not load the heading.',
  retry: 'Try again',
  ...extra,
});

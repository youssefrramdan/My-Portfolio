import { MAX_PAGE_BUTTONS, PROJECTS_SECTION_LIMITS, WORK_LIMITS } from '@shared/work';
import { WORK_PATH } from '../../lib/contentLibrary';
import { CTA_COPY } from '../../lib/cta';
import { REORDER_LABELS } from '../../lib/reorder';

export { WORK_PATH };
export const workEditPath = (id) => `${WORK_PATH}/${id}`;
export const workPreviewPath = (id) => `/admin/preview/work/${id}`;

/** Work list page (Content · Work). */
export const WORK_LIST = {
  eyebrow: 'Content library',
  title: 'Work',
  subtitle: 'Projects, case studies, apps, shoots, and campaigns — one reusable library.',
  add: 'New work',
  adding: 'Creating…',
  addError: 'Could not create a new item. Please try again.',

  library: 'All work',
  search: 'Search work...',
  searchLabel: 'Search work',
  untitled: 'Untitled work',
  noSummary: 'No summary yet',
  edit: (title) => `Edit ${title}`,
  move: (title) => `Reorder ${title}`,
  searching: 'Clear the search to reorder items.',
  orderError: 'Could not save the new order. It was put back.',
  results: (count) => `${count} ${count === 1 ? 'item' : 'items'}`,
  noResults: 'No work matches your search.',
  empty: { title: 'No work yet', text: 'Add your first project. It stays a draft until you publish it.' },
  notOnHome: 'Not on home',

  error: {
    title: 'Could not load your work',
    message: 'Something went wrong while loading the work library.',
    retry: 'Try again',
  },
  ...REORDER_LABELS,
};

/** Status badges shared by the list rows and the editor. */
export const WORK_STATUS = {
  published: 'Published',
  draft: 'Draft',
  changes: 'Unpublished changes',
};

/** Item state -> `published` | `changes` | `draft`. */
export const statusOf = (item) => (item.isLive ? (item.changes.length ? 'changes' : 'published') : 'draft');

/** "Main details": the "Selected Projects" heading on the home page. */
export const SECTION_FORM = {
  title: 'Main Details',
  description: 'The heading above your projects on the home page. Saved straight to the site.',
  badge: { label: 'Badge', placeholder: 'Explore My Work' },
  plain: { label: 'Title', placeholder: 'Selected' },
  highlight: { label: 'Highlighted words', optional: 'Optional', hint: 'Shown in green after the title.', placeholder: 'Projects' },
  sectionDescription: { label: 'Description', optional: 'Optional', placeholder: 'Each project starts with a problem…' },
  scrollButtonLabel: { label: 'Scroll button', optional: 'Optional', hint: 'Leave empty to hide the button.', placeholder: 'Scroll to explore' },
  cardCtaLabel: {
    label: 'Card link text',
    hint: 'Shown on project cards that have no text of their own. The card opens the project page.',
    placeholder: 'View Case Study',
  },
  pageButtons: {
    title: 'Project page buttons',
    text: `The floating buttons at the bottom of every project page, in this order (the first one is green). Up to ${MAX_PAGE_BUTTONS}; a project's own external link is added after them.`,
    button: (number) => `Button ${number}`,
    add: 'Add button',
    remove: (number) => `Remove button ${number}`,
    empty: 'No buttons. Project pages show only the project link, when it has one.',
    ...CTA_COPY,
    ctaLabel: { ...CTA_COPY.ctaLabel, placeholder: 'Message' },
  },
  save: 'Save changes',
  saving: 'Saving…',
  saved: 'Saved. The home page shows the new heading.',
  saveError: 'Could not save the heading. Please try again.',
  loadError: 'Could not load the heading.',
  retry: 'Try again',
  limits: PROJECTS_SECTION_LIMITS,
};

/** Work editor (Figma 538:9228). */
export const WORK_EDITOR = {
  back: 'Back to Work',
  notFound: {
    title: 'This work item does not exist',
    message: 'It may have been deleted. Go back to the Work list to pick another one.',
  },
  error: {
    title: 'Could not load this work item',
    message: 'Something went wrong while loading it.',
    retry: 'Try again',
  },

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
    error: 'Could not publish this item.',
  },

  required: {
    eyebrow: 'Required details',
    title: { label: 'Title', placeholder: 'Gadora — Real Estate Rental Web App' },
    description: { label: 'Short summary', placeholder: 'One or two sentences about the problem and the result.' },
    cover: {
      label: 'Cover image',
      choose: 'Choose from Media',
      hint: 'PNG, JPG, WEBP · Recommended 16:9',
      replace: 'Replace',
      upload: 'Upload new',
      uploading: (progress) => `Uploading ${progress}%`,
      remove: 'Remove cover',
      alt: { label: 'Cover alt text', optional: 'Optional', placeholder: 'Gadora home screen on a laptop' },
    },
  },

  details: {
    eyebrow: 'Work details',
    year: { label: 'Year', optional: 'Optional', placeholder: '2026' },
    role: { label: 'Role / contribution', optional: 'Optional', placeholder: 'Lead product designer' },
    client: { label: 'Client / organization', optional: 'Optional', placeholder: 'Gadora' },
    externalLink: { label: 'External link', optional: 'Optional', placeholder: 'https://' },
    linkLabel: { label: 'Link label', hint: 'The button text on the project page.' },
    cardLabel: {
      label: 'Card link text',
      optional: 'Optional',
      hint: 'Shown on this project’s card. Leave empty to use the text from Main details.',
      placeholder: 'View Live Project',
    },
    featured: { label: 'Featured on homepage', text: 'Show this item in the Selected Projects section.' },
    tags: {
      label: 'Tags',
      placeholder: 'Type a tag and press Enter',
      hint: 'Freeform tags are allowed; matching Capabilities are suggested first.',
      suggestions: 'Suggested from Capabilities',
      remove: (tag) => `Remove tag ${tag}`,
      max: `You can add up to ${WORK_LIMITS.tags} tags.`,
      count: (count) => `${count}/${WORK_LIMITS.tags}`,
    },
  },

  gallery: {
    title: 'Gallery',
    description: 'Optional ordered images for the project page. Drag to reorder; set each image to full or half width.',
    add: 'Add media',
    upload: 'Upload',
    uploading: (progress) => `Uploading ${progress}%`,
    count: (count) => `${count}/${WORK_LIMITS.gallery}`,
    full: `The gallery is full (${WORK_LIMITS.gallery} images).`,
    empty: 'No images yet. Add screens, mockups or photos; two half-width images sit side by side.',
    imageLabel: (index) => `Image ${index}`,
    move: (index) => `Reorder image ${index}`,
    remove: (index) => `Remove image ${index}`,
    layout: 'Width',
    layouts: { full: 'Full width', half: 'Half width' },
    layoutLabel: (index, layout) => `Image ${index}: ${layout}`,
    lonePartner: 'This half-width image has no partner next to it, so it fills its row. Add or move another half-width image beside it.',
    alt: { label: 'Alt text', placeholder: 'Describe the image' },
    altLabel: (index) => `Alt text for image ${index}`,
    ...REORDER_LABELS,
  },

  status: {
    eyebrow: 'Item status',
    draft: 'Draft',
    published: 'Published',
    changes: 'Published · unpublished changes',
    draftText: 'Published items can appear in a bound Page section. Drafts are visible only in your preview.',
    publishedText: 'This item is live. Edits stay in your draft until you publish them.',
    changesText: (count) => `${count} unpublished ${count === 1 ? 'change' : 'changes'}. Visitors see the published version.`,
    hiddenFromHome: 'Live on its own page only (not featured on the home page).',
    unpublish: 'Unpublish',
    unpublishing: 'Unpublishing…',
    unpublishTitle: 'Unpublish this item?',
    unpublishText: 'It disappears from the home page and its project page stops working. Your content stays here.',
    unpublishError: 'Could not unpublish this item. Please try again.',
    discard: 'Discard changes',
    discardTitle: 'Discard your changes?',
    discardText: 'Your draft goes back to the version that is live on the site. This cannot be undone.',
    discarding: 'Discarding…',
    discardError: 'Could not discard your changes. Please try again.',
    cancel: 'Keep editing',
    justPublished: 'Published. Your site now shows this item.',
  },

  /** Names of the changed fields in the status card. */
  fields: {
    title: 'Title',
    description: 'Summary',
    coverImage: 'Cover',
    year: 'Year',
    role: 'Role',
    client: 'Client',
    externalLink: 'External link',
    linkLabel: 'Link label',
    cardLabel: 'Card link text',
    featured: 'Featured',
    tags: 'Tags',
    gallery: 'Gallery',
  },

  preview: {
    eyebrow: 'Preview',
    page: 'Project page',
    card: 'Home card',
    tabsLabel: 'Preview type',
    draftNote: 'Shows your draft. Visitors see the published version.',
    emptyTitle: 'Your title appears here',
    emptySummary: 'Your short summary appears here.',
    noGallery: 'Gallery images appear here in order.',
    open: 'Open full preview',
    notFeatured: 'Not featured: this card is hidden on the home page.',
  },

  fullPreview: {
    banner: 'Draft preview',
    note: 'Visitors see the published version.',
    back: 'Back to editor',
  },

  remove: {
    eyebrow: 'Danger zone',
    action: 'Action',
    label: 'Delete Project',
    title: 'Delete this work item?',
    text: (title) => `“${title}” is removed from the library and the site. Its images stay in your media library. This cannot be undone.`,
    confirm: 'Delete',
    deleting: 'Deleting…',
    error: 'Could not delete this item. Please try again.',
    cancel: 'Cancel',
  },

  hint: {
    title: 'Autosave is on',
    text: 'This editor autosaves. Publish when the required fields and connected media are ready.',
  },

  validation: {
    tooLong: (max) => `Use ${max} characters or fewer`,
    year: `Use a year between ${WORK_LIMITS.yearMin} and ${WORK_LIMITS.yearMax}`,
    url: 'Enter a valid URL, e.g. https://example.com',
  },
};

import { TESTIMONIAL_LIMITS, TESTIMONIALS_SECTION_LIMITS as SECTION_LIMITS } from '@shared/testimonials';
import { imageFieldCopy } from '../../components/content/ImageField';
import { TESTIMONIALS_PATH } from '../../lib/contentLibrary';
import { editorCopy, listCopy, mainDetailsCopy } from '../../lib/contentItems';

export { TESTIMONIALS_PATH };
export const testimonialEditPath = (id) => `${TESTIMONIALS_PATH}/${id}`;

export const SOURCE_LABELS = { visitor: 'Visitor', admin: 'Admin' };

/** Testimonials list page (Figma 544:10947). */
export const TESTIMONIALS_LIST = {
  ...listCopy({ noun: 'testimonial', plural: 'testimonials' }),
  title: 'Testimonials',
  subtitle: 'Quotes from clients, teammates, professors, and collaborators. Visitors can send one from the site; you review it here.',
  add: 'New testimonial',
  library: 'All testimonials',
  pending: (count) => `${count} waiting for review`,
  untitled: 'Unnamed',
  noQuote: 'No quote yet.',
  sourceLabel: (source) => `Added by: ${SOURCE_LABELS[source]}`,
  edit: (name) => `Edit testimonial from ${name}`,
  actions: {
    approve: 'Approve',
    approving: 'Approving…',
    reject: 'Reject',
    publish: 'Publish',
    publishing: 'Publishing…',
    draft: 'Draft',
    moving: 'Moving…',
    delete: 'Delete',
    error: 'Could not update this testimonial. Open it to see what is missing.',
  },
  confirmReject: {
    title: 'Reject this testimonial?',
    text: (name) => `The testimonial from “${name}” is deleted. It never appeared on the site. This cannot be undone.`,
    confirm: 'Reject and delete',
  },
  confirmDelete: {
    title: 'Delete this testimonial?',
    text: (name) => `The testimonial from “${name}” is removed from the library and the site. This cannot be undone.`,
    confirm: 'Delete',
  },
  deleting: 'Deleting…',
  deleteError: 'Could not delete this testimonial. Please try again.',
  cancel: 'Cancel',
  empty: { title: 'No testimonials yet', text: 'Add a quote yourself, or wait for visitors to send one from the site.' },
};

export const SECTION_FORM = mainDetailsCopy({
  description: 'The heading and the “Leave a testimonial” invite on the home page. Saved straight to the site.',
  badge: 'Kind Words',
  title: 'What People Say.',
  subtitle: 'Support the section title with a short description...',
  ctaHeading: { label: 'Invite heading', optional: 'Optional', placeholder: 'Worked with me before?' },
  ctaButtonLabel: { label: 'Invite button', hint: 'Opens the testimonial form.', placeholder: 'Leave a Testimonial' },
  ctaDescription: { label: 'Invite text', optional: 'Optional', placeholder: 'Share your experience and help others know what it is like to collaborate.' },
});

export const SECTION_EXTRAS = [
  { name: 'ctaHeading', copy: SECTION_FORM.ctaHeading, max: SECTION_LIMITS.ctaHeading },
  { name: 'ctaButtonLabel', copy: SECTION_FORM.ctaButtonLabel, max: SECTION_LIMITS.ctaButtonLabel, required: true },
  { name: 'ctaDescription', copy: SECTION_FORM.ctaDescription, max: SECTION_LIMITS.ctaDescription, multiline: true },
];

const base = editorCopy({
  noun: 'testimonial',
  back: 'Back to Testimonials',
  deleteLabel: 'Delete Testimonial',
  deleteText: (name) => `The testimonial from “${name}” is removed from the library and the site. This cannot be undone.`,
  fields: { name: 'Name', role: 'Role', avatar: 'Avatar', message: 'Quote' },
  hintTitle: 'New testimonial',
});

/** Testimonial editor (Figma 544:11333). */
export const TESTIMONIAL_EDITOR = {
  ...base,
  publish: { ...base.publish, approve: 'Approve & publish' },
  status: {
    ...base.status,
    unpublish: 'Move to Draft',
    unpublishing: 'Moving…',
    unpublishTitle: 'Move this testimonial to draft?',
    pendingText: 'Sent from the public form. Edit it if needed, then approve to publish it, or delete it to reject.',
    source: { visitor: 'Sent by a visitor from the site.', admin: 'Added by you.' },
  },
  details: {
    eyebrow: 'Testimonial details',
    name: { label: 'Name', placeholder: 'Sara El-Masry' },
    role: { label: 'Role', placeholder: 'Product Manager', hint: 'Add the company after a dot, e.g. “Product Manager · Fintech Startup”.' },
    avatar: imageFieldCopy({ label: 'Avatar', altPlaceholder: 'Portrait of Sara', hint: 'PNG, JPG, WEBP · Square works best' }),
    message: { label: 'Quote', placeholder: 'What did they say about working with you?' },
  },
  limits: TESTIMONIAL_LIMITS,
};

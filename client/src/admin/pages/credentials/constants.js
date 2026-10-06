import { CREDENTIAL_LIMITS, CREDENTIALS_SECTION_LIMITS, DEFAULT_EDUCATION_LABEL } from '@shared/credentials';
import { imageFieldCopy } from '../../components/content/ImageField';
import { CREDENTIALS_PATH } from '../../lib/contentLibrary';
import { editorCopy, listCopy, mainDetailsCopy } from '../../lib/contentItems';

export { CREDENTIALS_PATH };
export const credentialEditPath = (id) => `${CREDENTIALS_PATH}/${id}`;

export const KIND_LABELS = {
  education: 'Education',
  certificate: 'Certificate',
  award: 'Award',
  publication: 'Publication',
};

/** Credentials list page (Figma 544:10339). */
export const CREDENTIALS_LIST = {
  ...listCopy({ noun: 'credential', plural: 'credentials' }),
  title: 'Credentials',
  subtitle: 'Degrees, certificates, awards, and publications — only what strengthens trust.',
  add: 'New credential',
  library: 'All credentials',
  search: 'Search credentials...',
  searchLabel: 'Search credentials',
  filterLabel: 'Filter by kind',
  all: 'All',
  untitled: 'Untitled credential',
  noIssuer: 'No issuer yet',
  filtering: 'Show all kinds and clear the search to reorder credentials.',
  noResults: 'No credentials match.',
  empty: { title: 'No credentials yet', text: 'Add a degree, certificate, award or publication. It stays a draft until you publish it.' },
  degreeNote: 'Each published Education item is a row of big cards; the other kinds are listed under them.',
};

export const SECTION_FORM = mainDetailsCopy({
  description: 'The heading of the Education & Learning section on the home page. Saved straight to the site.',
  badge: 'Background',
  title: 'Education & Learning.',
  subtitle: 'Support the section title with a short description...',
  listTitle: { label: 'List title', optional: 'Optional', hint: 'Heading of the card that lists certificates, awards and publications.', placeholder: 'Certificates' },
});

export const SECTION_EXTRAS = [{ name: 'certificatesTitle', copy: SECTION_FORM.listTitle, max: CREDENTIALS_SECTION_LIMITS.listTitle }];

/** Credential editor (Figma 544:10639). */
export const CREDENTIAL_EDITOR = {
  ...editorCopy({
    noun: 'credential',
    back: 'Back to Credentials',
    deleteLabel: 'Delete Credential',
    deleteText: (title) => `“${title}” is removed from the library and the site. This cannot be undone.`,
    fields: {
      title: 'Title',
      kind: 'Kind',
      issuer: 'Issuer',
      date: 'Date',
      link: 'Verification link',
      detail: 'Note',
      subjects: 'Subjects',
      label: 'Card label',
      image: 'Photo',
    },
    hintTitle: 'New credential',
  }),
  details: {
    eyebrow: 'Credential details',
    title: { label: 'Title', placeholder: 'B.Sc. Computer Science' },
    kind: { label: 'Kind' },
    issuer: { label: 'Issuer', placeholder: 'Institution or organization' },
    date: { label: 'Date', placeholder: '2025', hint: 'A year or a month, e.g. “October 2024”.' },
    link: { label: 'Verification link', optional: 'Optional', placeholder: 'https://', hint: 'The title links here on the site.' },
    detail: {
      label: 'Note',
      optional: 'Optional',
      placeholder: '41.5 total hours',
      educationPlaceholder: '4 years studying software engineering & CS fundamentals.',
      hint: 'Shown under the issuer.',
      educationHint: 'Shown on the graduation card.',
    },
  },
  education: {
    eyebrow: 'Education card',
    text: 'Every published Education item gets its own row on the site: a degree, a diploma like ITI, a bootcamp…',
    label: {
      label: 'Card label',
      optional: 'Optional',
      placeholder: DEFAULT_EDUCATION_LABEL,
      hint: `The pill above the title, e.g. “ITI Diploma”. Empty = “${DEFAULT_EDUCATION_LABEL}”.`,
    },
    image: {
      ...imageFieldCopy({ label: 'Photo', altPlaceholder: 'ITI graduation day with my team' }),
      optional: 'Optional',
      hint: 'With a photo the card spans the row and shows it on the right. Without one, the graduation card (date + note) sits next to it.',
    },
    subjects: {
      label: 'Subjects',
      optional: 'Optional',
      placeholder: 'Type a subject and press Enter',
      hint: `Up to ${CREDENTIAL_LIMITS.subjects} subjects.`,
      max: `You can add up to ${CREDENTIAL_LIMITS.subjects} subjects.`,
      remove: (subject) => `Remove subject ${subject}`,
      suggestions: '',
    },
  },
  validation: { url: 'Enter a valid URL, e.g. https://example.com' },
};

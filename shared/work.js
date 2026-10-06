/**
 * Work (projects) rules shared by the server (validator, publish checks) and the dashboard (form schema,
 * preview) and the public details page (gallery rows). Change them here only.
 */
export const WORK_LIMITS = {
  title: 80,
  description: 1000,
  role: 60,
  client: 60,
  linkLabel: 40,
  cardLabel: 30,
  tag: 30,
  tags: 10,
  gallery: 40,
  alt: 150,
  yearMin: 1990,
  yearMax: 2100,
};

/** The "Selected Projects" heading (Work page, "Main details"). */
export const PROJECTS_SECTION_LIMITS = {
  badge: 40,
  plain: 40,
  highlight: 40,
  description: 200,
  scrollButtonLabel: 30,
  cardCtaLabel: 30,
};

/**
 * The floating buttons on every project page (`{ label, action, target }`, the site's button actions), set once in
 * Work "Main details". The project's own external link is added after them.
 */
export const MAX_PAGE_BUTTONS = 3;
export const DEFAULT_PAGE_BUTTONS = [
  { label: 'Message', action: 'email', target: '' },
  { label: 'Download CV', action: 'cv', target: '' },
];

export const WORK_STATUSES = ['draft', 'published'];

/** Labels offered for the external link button on the details page. */
export const WORK_LINK_LABELS = [
  'Visit Website',
  'View Live Project',
  'View Prototype',
  'View Case Study',
  'Watch Video',
  'View on Behance',
  'View on Dribbble',
];
export const DEFAULT_LINK_LABEL = WORK_LINK_LABELS[0];

/** `full` spans the whole width; two `half` images in a row sit side by side. */
export const GALLERY_LAYOUTS = ['full', 'half'];

/**
 * Gallery images grouped into display rows: a `full` image is a row of its own, two consecutive `half` images
 * share a row. A `half` image without a partner gets a row of its own and fills it.
 */
export function galleryRows(gallery = []) {
  const rows = [];
  for (let index = 0; index < gallery.length; index += 1) {
    const item = gallery[index];
    const next = gallery[index + 1];
    if (item.layout === 'half' && next?.layout === 'half') {
      rows.push([item, next]);
      index += 1;
    } else {
      rows.push([item]);
    }
  }
  return rows;
}

/** Indexes of `half` images that have no partner (they fill their row like a `full` image). */
export function loneHalfImages(gallery = []) {
  let position = 0;
  return galleryRows(gallery).flatMap((row) => {
    const start = position;
    position += row.length;
    return row.length === 1 && row[0].layout === 'half' ? [start] : [];
  });
}

const filled = (value) => Boolean(String(value ?? '').trim());

/** What blocks publishing (`[{ field, message }]`, empty when the item can go live). */
export function workPublishProblems(work = {}) {
  const problems = [];
  if (!filled(work.title)) problems.push({ field: 'title', message: 'Add a title' });
  if (!filled(work.description)) problems.push({ field: 'description', message: 'Add a short summary' });
  if (!filled(work.coverImage?.url)) problems.push({ field: 'coverImage', message: 'Choose a cover image' });
  return problems;
}

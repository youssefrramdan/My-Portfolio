/**
 * Rules shared by the content modules that work like Work items (Capabilities, Credentials, Testimonials) and by
 * their "Main Details" heading forms. Read by the server validators and the dashboard form schemas.
 */
export const CONTENT_STATUSES = ['draft', 'published'];

/** Home section headings: eyebrow badge, title (with highlighted words at the end) and an optional subtitle. */
export const SECTION_HEADING_LIMITS = {
  badge: 40,
  title: 80,
  description: 240,
};

/** Public navbar label of a home section (empty = the section's default label). */
export const NAV_LABEL_MAX = 24;

/** Words of a heading, split on whitespace. */
export const headingWords = (text = '') => String(text).trim().split(/\s+/).filter(Boolean);

/**
 * Stored heading `{ plain, highlight }` -> the one-line title the dashboard edits and how many of its last words
 * are highlighted.
 */
export function headingFromTitle(title = {}) {
  const plain = headingWords(title.plain);
  const highlight = headingWords(title.highlight);
  return { text: [...plain, ...highlight].join(' '), highlightCount: highlight.length };
}

/** One-line title + highlighted word count -> stored `{ plain, highlight }` (the highlight is always the end). */
export function titleFromHeading(text = '', highlightCount = 0) {
  const words = headingWords(text);
  const count = Math.min(Math.max(0, highlightCount), words.length);
  return { plain: words.slice(0, words.length - count).join(' '), highlight: words.slice(words.length - count).join(' ') };
}

export const filled = (value) => Boolean(String(value ?? '').trim());

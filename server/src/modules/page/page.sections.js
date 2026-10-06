/**
 * Home page sections. `key` never changes; `label` / `source` / `type` are what the dashboard shows
 * (`source` = the admin area that edits the content); `navLabel` is the default navbar label (the admin can rename
 * it); `anchor` is the section's element id on the site (what "Scroll to section" buttons target).
 * Array order = the default home order.
 */
export const PAGE_SECTIONS = [
  { key: 'hero', type: 'hero', label: 'Hero', source: 'Identity', navLabel: 'About', anchor: 'about' },
  { key: 'skills', type: 'capabilities', label: 'Tools & Methods', source: 'Capabilities', navLabel: 'Skills', anchor: 'skills' },
  { key: 'projects', type: 'work', label: 'Selected Projects', source: 'Work', navLabel: 'Projects', anchor: 'projects' },
  { key: 'education', type: 'credentials', label: 'Education & Learning', source: 'Credentials', navLabel: 'Education', anchor: 'education' },
  { key: 'testimonials', type: 'testimonials', label: 'What People Say', source: 'Testimonials', navLabel: 'Testimonials', anchor: 'testimonials' },
  { key: 'contact', type: 'contact', label: 'Contact', source: 'Contact', navLabel: 'Contact', anchor: 'contact' },
];

export const SECTION_ANCHORS = PAGE_SECTIONS.map((section) => section.anchor);

export const SECTION_KEYS = PAGE_SECTIONS.map((section) => section.key);

export const SECTION_BY_KEY = Object.fromEntries(PAGE_SECTIONS.map((section) => [section.key, section]));

/** First problem with a list of keys (unknown, duplicate or missing), or null when it is exactly the full set. */
export function findKeyProblem(keys) {
  const seen = new Set();
  for (const key of keys) {
    if (!SECTION_BY_KEY[key]) return `Unknown section key: ${key}`;
    if (seen.has(key)) return `Duplicate section key: ${key}`;
    seen.add(key);
  }
  const missing = SECTION_KEYS.find((key) => !seen.has(key));
  return missing ? `Missing section key: ${missing}` : null;
}

/**
 * Stored sections in display order with every key present exactly once: unknown and duplicate entries are
 * dropped, missing keys are appended as visible, and `order` is renumbered 0..n-1. `navLabel` = the stored custom
 * label ('' = default).
 */
export function completeSections(sections = []) {
  const seen = new Set();
  const kept = [];
  for (const section of [...sections].sort((a, b) => a.order - b.order)) {
    if (!SECTION_BY_KEY[section.key] || seen.has(section.key)) continue;
    seen.add(section.key);
    kept.push(section);
  }
  const missing = SECTION_KEYS.filter((key) => !seen.has(key)).map((key) => ({ key, isVisible: true }));
  return [...kept, ...missing].map(({ key, isVisible, navLabel }, order) => ({
    key,
    isVisible: isVisible ?? true,
    navLabel: navLabel ?? '',
    order,
  }));
}

/** The label the navbar shows for a section: the custom one, else the default. */
export const navLabelOf = (section) => section.navLabel || SECTION_BY_KEY[section.key].navLabel;

/** Adds the dashboard `label`, `source`, `type` and `defaultNavLabel` to stored sections. */
export const withSectionInfo = (sections) =>
  sections.map((section) => {
    const { label, source, type, navLabel } = SECTION_BY_KEY[section.key];
    return { ...section, label, source, type, defaultNavLabel: navLabel };
  });

/** `{ key, anchor, label, isVisible }` per section, in page order (targets for "Scroll to section"). */
export const scrollTargets = (sections) =>
  sections.map(({ key, isVisible }) => ({
    key,
    anchor: SECTION_BY_KEY[key].anchor,
    label: SECTION_BY_KEY[key].label,
    isVisible,
  }));

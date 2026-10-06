/**
 * Identity rules shared by the server (validator, publish checks, overview) and the dashboard
 * (form schema, completion bar, live preview). Change them here only.
 */
export const IDENTITY_LIMITS = {
  displayName: 40,
  role: 40,
  title: 80,
  description: 320,
  ctaLabel: 30,
  alt: 150,
  statLabel: 20,
  statTitle: 30,
  statSuffix: 3,
  statNumber: 1000000,
  skillLabel: 40,
  imageSlots: 2,
  slotImages: 6,
  stats: 4,
  skillTags: 20,
  fileName: 120,
  cursorLabel: 40,
};

/**
 * The Figma-style cursor that follows the mouse over the hero photo: arrow `color`, name tag `background`
 * (its text turns dark or light to stay readable). Defaults to the Figma teal brand color.
 */
export const PHOTO_CURSOR = { color: '#35d0ba', background: '#35d0ba' };

export const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export const cursorColor = (value, fallback) =>
  typeof value === 'string' && HEX_COLOR.test(value.trim()) ? value.trim().toLowerCase() : fallback;

/** True when dark text reads better than light text on `hex` (relative luminance, WCAG). */
export function isLightColor(hex) {
  if (!HEX_COLOR.test(hex ?? '')) return true;
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = Number.parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.179;
}

/**
 * What a site button does. `email` opens Gmail to the contact email, `whatsapp` opens a chat with the WhatsApp
 * number (both from the Contact page) and `cv` opens the uploaded resume, so none of them has a target of its own.
 */
export const IDENTITY_CTA_ACTIONS = ['scroll', 'link', 'email', 'whatsapp', 'cv'];
export const CTA_ACTIONS_WITH_TARGET = ['scroll', 'link'];

/** WhatsApp number in international format: "+20 100 123 4567" is fine, stored as typed. */
export const WHATSAPP_NUMBER = /^\+?[\d\s()-]{7,20}$/;
export const whatsappDigits = (value) => String(value ?? '').replace(/\D/g, '');
export const whatsappUrl = (value) => (whatsappDigits(value) ? `https://wa.me/${whatsappDigits(value)}` : '');

/** Seconds each headline image stays before the next one replaces it. */
export const IMAGE_INTERVAL = { min: 0.3, max: 10, step: 0.1, default: 1.5 };

export const clampImageInterval = (value) => {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return IMAGE_INTERVAL.default;
  return Math.min(IMAGE_INTERVAL.max, Math.max(IMAGE_INTERVAL.min, Math.round(seconds * 10) / 10));
};

/** Upload limits and accepted types for the media library. */
export const MEDIA_LIMITS = {
  imageBytes: 5 * 1024 * 1024,
  fileBytes: 10 * 1024 * 1024,
  imageTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  fileTypes: ['application/pdf'],
};

export const MEDIA_KINDS = ['image', 'file'];

/** Words of a title, split on whitespace. Image spots and the line break hang after one of them. */
export const titleWords = (title = '') => String(title).trim().split(/\s+/).filter(Boolean);

/** Index of the word an anchor `{ word, occurrence }` points at, or -1 when that word is not in the title. */
export function anchorIndex(words, anchor) {
  if (!anchor) return -1;
  let seen = -1;
  for (let index = 0; index < words.length; index += 1) {
    if (words[index] === anchor.word) {
      seen += 1;
      if (seen === anchor.occurrence) return index;
    }
  }
  return -1;
}

/** Anchor for the word at `index`: the word plus how many times it appeared before (repeated words). */
export const anchorAt = (words, index) => ({
  word: words[index],
  occurrence: words.slice(0, index).filter((word) => word === words[index]).length,
});

/** Anchors (image spots + line break) that no longer match a word of `title`. */
export function orphanedAnchors({ title, imageSlots = [], lineBreak }) {
  const words = titleWords(title);
  const slots = imageSlots.filter((slot) => anchorIndex(words, slot) === -1);
  const breakIndex = anchorIndex(words, lineBreak);
  const lineBreakLost = Boolean(lineBreak) && (breakIndex === -1 || breakIndex === words.length - 1);
  return { slots, lineBreak: lineBreakLost };
}

/** "5+" -> { number: 5, suffix: "+" }, "100%" -> { number: 100, suffix: "%" }, invalid -> null. */
export function parseStatValue(value) {
  const match = String(value ?? '')
    .trim()
    .match(/^(\d+(?:\.\d+)?)\s*([^\d\s]{0,3})$/);
  if (!match) return null;
  const number = Number(match[1]);
  return number <= IDENTITY_LIMITS.statNumber ? { number, suffix: match[2] } : null;
}

export const formatStatValue = ({ number, suffix = '' } = {}) => (number === undefined ? '' : `${number}${suffix}`);

const filled = (value) => Boolean(String(value ?? '').trim());

export const isCtaComplete = (cta) =>
  Boolean(
    cta &&
      filled(cta.label) &&
      IDENTITY_CTA_ACTIONS.includes(cta.action) &&
      (!CTA_ACTIONS_WITH_TARGET.includes(cta.action) || filled(cta.target)),
  );

/** The "Identity complete" bar: one item per piece the hero needs to look finished. */
export function identityChecklist(identity = {}) {
  return [
    { key: 'displayName', done: filled(identity.displayName) },
    { key: 'role', done: filled(identity.role) },
    { key: 'title', done: filled(identity.title) },
    { key: 'ctaPrimary', done: isCtaComplete(identity.ctaPrimary) },
    { key: 'ctaSecondary', done: isCtaComplete(identity.ctaSecondary) },
    { key: 'photo', done: filled(identity.photo?.url) },
    { key: 'logo', done: filled(identity.logo?.url) },
    { key: 'cv', done: filled(identity.cv?.url) },
  ];
}

export function identityCompletion(identity) {
  const items = identityChecklist(identity);
  const done = items.filter((item) => item.done).length;
  return { items, done, total: items.length, percent: Math.round((done / items.length) * 100) };
}

/**
 * What blocks publishing (`[{ field, message }]`, empty when it can go live). Drafts may be incomplete;
 * the live hero may not.
 */
export function publishProblems(identity = {}) {
  const problems = [];
  const require = (field, value, message) => {
    if (!filled(value)) problems.push({ field, message });
  };

  require('displayName', identity.displayName, 'Add a display name');
  require('role', identity.role, 'Add your professional title');
  require('title', identity.title, 'Add a hero title');
  require('photo', identity.photo?.url, 'Add a portrait');

  for (const [field, name] of [
    ['ctaPrimary', 'primary'],
    ['ctaSecondary', 'secondary'],
  ]) {
    const cta = identity[field];
    if (!filled(cta?.label)) problems.push({ field: `${field}.label`, message: `Add a label to the ${name} button` });
    if (CTA_ACTIONS_WITH_TARGET.includes(cta?.action) && !filled(cta?.target)) {
      const what = cta.action === 'scroll' ? 'a section' : 'a link';
      problems.push({ field: `${field}.target`, message: `Choose ${what} for the ${name} button` });
    }
  }

  (identity.imageSlots ?? []).forEach((slot, index) => {
    if (!slot.images?.length) {
      problems.push({
        field: `imageSlots.${index}`,
        message: `Add images after "${slot.word}" or remove that spot`,
      });
    }
  });
  (identity.stats ?? []).forEach((stat, index) => {
    if (!filled(stat.title)) problems.push({ field: `stats.${index}.title`, message: `Highlight ${index + 1} needs a title` });
  });
  (identity.skillTags ?? []).forEach((tag, index) => {
    if (!filled(tag.label)) problems.push({ field: `skillTags.${index}.label`, message: `Capability tag ${index + 1} needs a name` });
  });

  return problems;
}

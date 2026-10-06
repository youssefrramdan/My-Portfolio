/**
 * Contact rules shared by the server (models, validators, overview) and the dashboard (Contact page, setup
 * checklist). The public site keeps the matching brand icons in `features/contact/socialPlatforms.js`.
 */
export const SOCIAL_PLATFORMS = {
  linkedin: 'LinkedIn',
  behance: 'Behance',
  github: 'GitHub',
  instagram: 'Instagram',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  discord: 'Discord',
  x: 'X',
};

export const PLATFORM_KEYS = Object.keys(SOCIAL_PLATFORMS);

/** The Contact arc has room for eight icons. */
export const MAX_SOCIALS = 8;

/** The setup checklist asks for at least this many social links. */
export const MIN_SOCIALS = 2;

export const CONTACT_LIMITS = {
  email: 120,
  url: 300,
  ctaLabel: 30,
};

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

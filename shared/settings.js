/**
 * Settings rules shared by the server validators and the dashboard Settings pages (General, SEO, Coming soon,
 * Account).
 */
export const SETTINGS_LIMITS = {
  siteName: 70,
  siteUrl: 200,
  profileName: 60,
  profileTitle: 60,
  copyright: 80,
  backToTop: 30,
  alt: 160,
};

/** Google cuts titles around 60 characters and descriptions around 160. */
export const SEO_LIMITS = {
  title: 60,
  description: 160,
  verification: 100,
};

/** Size social networks expect for the sharing image (1.91 : 1). */
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

/** Site-wide brand color (Settings > General): buttons, highlights, active states. Figma teal. */
export const DEFAULT_BRAND_COLOR = '#35d0ba';

export const COMING_SOON_LIMITS = {
  badge: 30,
  title: 60,
  message: 240,
  description: 120,
};

/** bcrypt only reads the first 72 bytes of a password. */
export const PASSWORD_LIMITS = { min: 10, max: 72 };

/** Google Search Console "HTML tag" method: only the `content` value of the meta tag. */
export const VERIFICATION_PATTERN = /^[\w-]+$/;

/** `https://example.com/` -> `https://example.com` (no trailing slash, no path / query / hash). */
export function siteOrigin(url = '') {
  try {
    const parsed = new URL(String(url).trim());
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
    return parsed.origin;
  } catch {
    return '';
  }
}

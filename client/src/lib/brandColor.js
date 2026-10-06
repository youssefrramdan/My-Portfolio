import { HEX_COLOR, isLightColor } from '@shared/identity';

/** Read by the inline script in `index.html` so a returning visitor never sees the default color first. */
export const BRAND_STORAGE_KEY = 'brand-color';

/** Text color on brand fills: dark on a light brand color, white on a dark one. */
const ON_LIGHT = 'var(--color-neutral-surface-black)';
const ON_DARK = 'var(--color-neutral)';

/** `public/cursors/arrow.svg` filled with `hex` (a CSS cursor image cannot read CSS variables). */
const cursorArrow = (hex) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3.5 2.5 20 9.6l-7 2.2-3.2 6.7L3.5 2.5Z" fill="${hex}" stroke="#161816" stroke-width="1.5" stroke-linejoin="round"/></svg>`,
  )}")`;

/**
 * Applies the saved brand color to the whole app (`--color-brand-color` feeds every brand token) and remembers it.
 * An invalid or missing value keeps the default from `theme.css`.
 */
export function applyBrandColor(hex) {
  if (!HEX_COLOR.test(hex ?? '')) return;
  const onBrand = isLightColor(hex) ? ON_LIGHT : ON_DARK;
  const root = document.documentElement.style;
  root.setProperty('--color-brand-color', hex);
  root.setProperty('--color-on-brand', onBrand);
  const cursor = cursorArrow(hex);
  root.setProperty('--cursor-arrow', cursor);
  try {
    localStorage.setItem(BRAND_STORAGE_KEY, JSON.stringify({ brand: hex, onBrand, cursor }));
  } catch {
    // Private mode / storage full: the color still applies for this visit.
  }
}

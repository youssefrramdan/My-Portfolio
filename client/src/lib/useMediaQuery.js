import { useSyncExternalStore } from 'react';

/** `true` while the CSS media query matches (e.g. `useMediaQuery('(min-width: 80rem)')`). */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Same values as the Tailwind breakpoints (`tablet`, `lg` (admin only), `xl`). */
export const MEDIA = {
  tablet: '(min-width: 48rem)',
  lg: '(min-width: 64rem)',
  xl: '(min-width: 80rem)',
};

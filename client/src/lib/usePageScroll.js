import { useLayoutEffect } from 'react';
import { useNavigationType } from 'react-router-dom';

const positions = new Map();

/**
 * Page-level scroll for pages that replace each other (home <-> all projects): a link opens the page at the top,
 * browser back / forward returns to where the visitor left it. The first load keeps the browser's own position.
 */
export function usePageScroll(key) {
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    const saved = positions.get(key);
    if (navigationType !== 'POP') window.scrollTo({ top: 0, behavior: 'instant' });
    else if (saved !== undefined) window.scrollTo({ top: saved, behavior: 'instant' });
    return () => positions.set(key, window.scrollY);
    // Mount / unmount only: the position belongs to this visit of the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

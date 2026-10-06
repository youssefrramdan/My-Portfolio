import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** How long to wait for the section to mount, then how long to keep it aligned while the content above loads. */
const WAIT_MS = 5000;
const SETTLE_MS = 1500;
const STOP_EVENTS = ['wheel', 'touchstart', 'keydown'];

/**
 * Opens the page scrolled to `location.state.section` (navbar links from other pages). Sections mount as their
 * data arrives, so it waits for the element, then keeps it aligned while the page above it settles; any scroll
 * input from the visitor stops that. The state is dropped from the history entry so back / reload do not jump.
 */
export function useLinkedSection() {
  const { state, key } = useLocation();
  const id = state?.section;

  useEffect(() => {
    if (!id) return undefined;
    // Router state lives in `history.state.usr`; navigating to clear it would re-run this effect.
    window.history.replaceState({ ...window.history.state, usr: null }, '');

    let resize;
    let settle;
    const align = () => document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' });
    const stop = () => {
      clearTimeout(wait);
      clearTimeout(settle);
      mutations.disconnect();
      resize?.disconnect();
      STOP_EVENTS.forEach((type) => window.removeEventListener(type, stop));
    };
    const start = () => {
      if (!document.getElementById(id)) return;
      mutations.disconnect();
      align();
      resize = new ResizeObserver(align);
      resize.observe(document.body);
      settle = setTimeout(stop, SETTLE_MS);
    };

    const mutations = new MutationObserver(start);
    mutations.observe(document.body, { childList: true, subtree: true });
    const wait = setTimeout(stop, WAIT_MS);
    STOP_EVENTS.forEach((type) => window.addEventListener(type, stop, { passive: true }));
    start();
    return stop;
  }, [id, key]);
}

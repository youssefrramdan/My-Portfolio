import { easeInOut, motionValue, useMotionValueEvent, useScroll, useSpring } from 'framer-motion';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { UNFOLD } from '@/lib/motion';
import { NAV_HEIGHT, STACK } from './stack';

/** Header children that slide (badge, title, description, button). */
const HEADER_ITEMS = 4;

const clamp01 = (value) => Math.min(1, Math.max(0, value));
const within = (value, [from, to]) => clamp01((value - from) / (to - from));

const cardValues = () => ({
  x: motionValue(0),
  y: motionValue(0),
  rotate: motionValue(0),
  scale: motionValue(1),
  opacity: motionValue(1),
});

function createValues() {
  return {
    header: { y: motionValue(0) },
    items: Array.from({ length: HEADER_ITEMS }, () => ({ x: motionValue(0) })),
    cards: [],
    descriptionLeft: { opacity: motionValue(0) },
    descriptionCenter: { opacity: motionValue(1) },
    toggle: { opacity: motionValue(1) },
  };
}

/**
 * Desktop "Stack -> Row" unfold. The DOM is always laid out as the Row; while the section's sticky stage is
 * pinned, scroll progress (spring-smoothed) moves each of the first cards from its row slot to its Figma stack slot and slides
 * the header items from centered to left-aligned (transforms and opacity only). Scrolling back re-stacks.
 *
 * `refs` (React refs): `section`, `stage` (sticky), `frame` (content box, scaled to fit short screens),
 * `header` (the block that moves down), `items` / `cardItems` (arrays of elements) and `cards` (the row scroller).
 *
 * Returns the motion values to bind as `style`, the frame `fit`, whether the row is fully `unfolded`
 * and `endScroll()` = the page scroll where the unfold completes.
 */
export function useStackUnfold({ enabled, refs, count }) {
  const valuesRef = useRef(null);
  valuesRef.current ??= createValues();
  const values = valuesRef.current;
  while (values.cards.length < count) values.cards.push(cardValues());

  const geometry = useRef(null);
  const [fit, setFit] = useState(null);
  const [unfolded, setUnfolded] = useState(true);

  const distance = useCallback(() => refs.section.current.offsetHeight - refs.stage.current.offsetHeight, [refs]);

  const progress = useCallback(() => {
    const total = distance();
    return total > 0 ? clamp01(-refs.section.current.getBoundingClientRect().top / total) : 1;
  }, [refs, distance]);

  const reset = useCallback(() => {
    values.header.y.set(0);
    values.items.forEach((item) => item.x.set(0));
    values.cards.forEach((card) => {
      card.x.set(0);
      card.y.set(0);
      card.rotate.set(0);
      card.scale.set(1);
      card.opacity.set(1);
    });
    values.descriptionLeft.opacity.set(0);
    values.descriptionCenter.opacity.set(1);
    values.toggle.opacity.set(1);
    setUnfolded(true);
  }, [values]);

  const smoothProgress = useSpring(0, UNFOLD.spring);

  const render = useCallback(() => {
    const slots = geometry.current;
    if (!enabled || !slots) return;
    const p = smoothProgress.get();
    const t = easeInOut(within(p, UNFOLD.cards));
    const rest = 1 - t;

    values.cards.forEach((card, index) => {
      const slot = slots.cards[index];
      card.x.set(slot ? slot.x * rest : 0);
      card.y.set(slot ? slot.y * rest : 0);
      card.rotate.set(slot ? slot.rotate * rest : 0);
      card.scale.set(slot ? STACK.scale + (1 - STACK.scale) * t : 1);
      // Cards beyond the stack are not part of it: they fade in at the end of the unfold.
      card.opacity.set(slot ? 1 : within(t, UNFOLD.extras));
    });
    values.items.forEach((item, index) => item.x.set((slots.items[index] ?? 0) * rest));
    values.header.y.set(slots.headerY * rest);

    const left = 1 - within(t, UNFOLD.text);
    values.descriptionLeft.opacity.set(left);
    values.descriptionCenter.opacity.set(1 - left);
    values.toggle.opacity.set(within(p, UNFOLD.toggle));
    setUnfolded(t >= 1);
  }, [enabled, smoothProgress, values]);

  /** Snaps to the current scroll position without easing (first paint, resize, layout changes). */
  const apply = useCallback(() => {
    if (!enabled || !geometry.current) return;
    smoothProgress.jump(progress());
    render();
  }, [enabled, progress, smoothProgress, render]);

  /** Scale that fits the Row layout between the navbar and the stage's bottom padding (the gap to the next section). */
  const measureFit = useCallback(() => {
    const stage = refs.stage.current;
    const frame = refs.frame.current;
    if (!stage || !frame) return;
    const bottomGap = parseFloat(getComputedStyle(stage).paddingBottom) || 0;
    const available = stage.clientHeight - NAV_HEIGHT - bottomGap;
    const height = frame.offsetHeight;
    const scale = Math.min(1, available / height);
    const top = NAV_HEIGHT + Math.max(0, (available - height * scale) / 2);
    setFit((previous) =>
      previous && Math.abs(previous.scale - scale) < 0.001 && Math.abs(previous.top - top) < 0.5
        ? previous
        : { scale, top },
    );
  }, [refs]);

  /** Offsets (unscaled frame px, transforms ignored) from each element's row position to its stack position. */
  const measureGeometry = useCallback(() => {
    const frame = refs.frame.current;
    const header = refs.header.current;
    const row = refs.cards.current;
    if (!frame || !header || !row) return;

    const width = frame.offsetWidth;
    const blockTop = (frame.offsetHeight - STACK.height) / 2;
    const margin = parseFloat(getComputedStyle(header).paddingLeft) || 0;

    geometry.current = {
      headerY: blockTop - header.offsetTop,
      items: refs.items.current.map((item) => (item ? margin - item.offsetLeft : 0)),
      cards: refs.cardItems.current.slice(0, count).map((card, index) => {
        const slot = STACK.cards[index];
        if (!card || !slot) return null;
        const centerX = row.offsetLeft + card.offsetLeft + card.offsetWidth / 2;
        const centerY = row.offsetTop + card.offsetTop + card.offsetHeight / 2;
        return {
          x: width * STACK.anchorX + slot.x - centerX,
          y: blockTop + STACK.centerY - centerY,
          rotate: slot.rotate,
        };
      }),
    };
  }, [refs, count]);

  useLayoutEffect(() => {
    if (enabled) {
      measureFit();
      return;
    }
    geometry.current = null;
    setFit(null);
    reset();
  }, [enabled, count, measureFit, reset]);

  useLayoutEffect(() => {
    if (!enabled || !fit) return;
    measureGeometry();
    apply();
  }, [enabled, fit, measureGeometry, apply]);

  useEffect(() => {
    if (!enabled) return undefined;
    let active = true;
    const remeasure = () => {
      if (!active) return;
      measureFit();
      measureGeometry();
      apply();
    };
    const observer = new ResizeObserver(remeasure);
    observer.observe(refs.stage.current);
    observer.observe(refs.frame.current);
    document.fonts?.ready.then(remeasure);
    return () => {
      active = false;
      observer.disconnect();
    };
  }, [enabled, refs, measureFit, measureGeometry, apply]);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', () => {
    if (enabled && geometry.current) smoothProgress.set(progress());
  });
  useMotionValueEvent(smoothProgress, 'change', render);

  // Re-stacking starts from the first card: bring a scrolled row back to its start.
  useEffect(() => {
    const row = refs.cards.current;
    if (enabled && !unfolded && row?.scrollLeft > 0) row.scrollTo({ left: 0, behavior: 'smooth' });
  }, [enabled, unfolded, refs]);

  const endScroll = useCallback(
    () => window.scrollY + refs.section.current.getBoundingClientRect().top + distance(),
    [refs, distance],
  );

  return { values, fit, unfolded, endScroll };
}

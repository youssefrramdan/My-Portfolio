import { useReducedMotion } from 'framer-motion';

/**
 * Motion constants for the whole site. Components never hardcode durations or distances.
 * Hero entrance values come from the Figma motion data of frame 184:20705
 * (7s timeline: travel ends at 28.5% = 2s, fade ends at 12.6% = 0.9s).
 */
export const EASE = [0.36, 0.01, 0.07, 1];

/** Idle loops only: a symmetric curve (Figma idle tracks) so direction changes stay smooth. */
export const IDLE_EASE = [0.5, 0, 0.5, 1];

export const ENTRANCE = {
  duration: 2,
  fade: 0.9,
  stagger: 0.06,
};

/** Start offsets (px) of the entrance travel. Negative = from above. */
export const DISTANCE = {
  navbar: -92,
  info: -518,
  stripes: -535,
  name: 189,
  cards: 300,
  image: 717,
};

export const STAT_FLOAT = { offset: 5, rotate: 1.5, minDuration: 5, maxDuration: 8, points: 4 };
export const TAG_FLOAT = { offset: 6, baseDuration: 3.4, durationStep: 0.45, phaseStep: 0.35 };
/** Skills column: every `interval` ms the tags move up one slot so each skill reaches the center. */
export const TAG_CYCLE = { interval: 2200, duration: 0.9 };
export const ODOMETER = { duration: 1.1, digitStagger: 0.08, delay: 0.5, spins: 1 };
export const HOVER = { shine: 0.55, arrow: 0.35, glowFade: 0.4 };
/** Skill card hover (Figma smart animate: 10px up, 0.3s ease-out). The border color uses the same timing in CSS. */
export const CARD_HOVER = { lift: -10, duration: 0.3, ease: 'easeOut' };
/** Project card hover (Figma: 5px up + green border, smart animate 0.3s ease-out). */
export const PROJECT_HOVER = { lift: -5, duration: 0.3, ease: 'easeOut' };
/** Projects Row <-> Grid switch (Figma smart animate, ease-out 0.3s). */
export const VIEW_SWITCH = { duration: 0.3, ease: 'easeOut' };
/**
 * Projects Stack -> Row unfold on desktop, driven by scroll (no Figma motion data, so these are our values).
 * `track` = scroll distance in viewport heights; `cards` / `toggle` = progress ranges of each part.
 * `spring` smooths the scroll progress so wheel steps glide instead of jumping (critically damped, no overshoot).
 */
export const UNFOLD = {
  track: 0.65,
  cards: [0.04, 0.82],
  text: [0.35, 0.65],
  extras: [0.6, 1],
  toggle: [0.82, 1],
  spring: { stiffness: 300, damping: 35, mass: 1, restDelta: 0.0005 },
};
export const GLOW_SPRING = { stiffness: 120, damping: 18, mass: 0.6 };
export const MENU = { duration: 0.35 };
/**
 * Modals (no Figma motion data, so these are our values): the dialog fades in from `scaleFrom`, the blurred
 * backdrop fades over `fade` s. `successClose` = seconds before a sent form closes itself.
 */
export const MODAL = { duration: 0.35, fade: 0.25, scaleFrom: 0.96, successClose: 2.5 };

/**
 * Project page over the home (our values, no Figma motion data): the blurred layer fades in over `fade` s while
 * the content rises `rise` px over `duration` s. Reduced motion = fade only.
 */
export const PROJECT_OVERLAY = { fade: 0.35, duration: 0.6, rise: 48 };

/** Dialog + backdrop variants for `Modal`. Reduced motion keeps only the fade. */
export function modalVariants(reduce) {
  const fade = { duration: MODAL.fade, ease: EASE };
  return {
    backdrop: { hidden: { opacity: 0, transition: fade }, visible: { opacity: 1, transition: fade } },
    dialog: {
      hidden: { opacity: 0, scale: reduce ? 1 : MODAL.scaleFrom, transition: fade },
      visible: { opacity: 1, scale: 1, transition: { duration: MODAL.duration, ease: EASE } },
    },
  };
}

/**
 * Scroll reveal for sections below the hero (no Figma motion data, so these are our values).
 * Plays once when `amount` of the section is visible. `rise` = from below, `slide` = side lights.
 */
export const REVEAL = { rise: 48, slide: 160, duration: 0.9, fade: 0.6, stagger: 0.12, amount: 0.25 };
/**
 * Education cards (our values). Side by side (xl), the degree card slides in `slide` px from the left and the
 * graduation card from the right; stacked, both only rise `rise` px (no horizontal travel on small screens).
 * Certificate rows rise `rowRise` px, starting `rowsDelay` s after their card, `rowStagger` s apart.
 */
export const EDUCATION_REVEAL = { slide: 120, rise: 24, rowRise: 16, rowsDelay: 0.3, rowStagger: 0.08 };

/**
 * Testimonials loop (our values): the cards row moves `speed` px per second right to left. `maxStep` caps one
 * frame's travel (ms) so the row does not jump after the tab was in the background. After a drag / fling / arrow key,
 * the row's speed eases back to `speed` (or to 0 while paused) at `friction` per second; a fling is capped at
 * `maxFling` px/s; a press becomes a drag after `dragThreshold` px.
 */
export const MARQUEE = { speed: 40, maxStep: 100, friction: 4, maxFling: 3000, dragThreshold: 6 };

/** Contact social icon hover (our values, same timing as the card hovers): `lift` px up. */
export const SOCIAL_HOVER = { lift: -4, duration: 0.3, ease: 'easeOut' };

/**
 * Contact reveal (our values, no Figma motion data). The green arc draws from both bottom ends up to the top
 * over `draw` s after `delay` s, with a glow dot riding each tip. Each icon pops (scale `iconFrom` -> 1 + fade)
 * as the line reaches it, over `iconWindow` of the draw. The faint arcs fade in (`faintFade` s) once `faintAt`
 * of the arc is drawn. The lines beside the buttons and under the top extend outward over `lineExtend` s.
 */
export const CONTACT_MOTION = {
  delay: 0.2,
  draw: 1.6,
  ease: 'easeInOut',
  iconFrom: 0.6,
  iconWindow: 0.1,
  faintAt: 0.7,
  faintFade: 0.8,
  lineExtend: 0.8,
};

/**
 * Coming Soon page (our values, no Figma motion data). The round image turns once every `spin` s (linear,
 * endless) and the dashed ring the other way every `ringSpin` s. The glow floats `float` px up and back over
 * `floatDuration` s. Entrance: items rise `rise` px, `stagger` s apart after `delay` s; the image scales in from
 * `imageFrom` over `imageDuration` s. `imageWidth` = Cloudinary delivery width (2x the largest frame, 420px).
 */
export const COMING_SOON = {
  spin: 24,
  ringSpin: 48,
  float: 24,
  floatDuration: 8,
  rise: 24,
  stagger: 0.1,
  delay: 0.1,
  imageFrom: 0.85,
  imageDuration: 0.9,
  imageWidth: 840,
};

/**
 * Admin dashboard (our values, no Figma motion data). Cards rise `rise` px and fade in `stagger` s apart.
 * Login: the card rises `cardRise` px, then its content staggers in `contentStagger` s apart after `contentDelay` s.
 * `drawer` = mobile sidebar slide, `menu` = popover fade, `hoverLift` = tile hover lift (px).
 */
export const ADMIN_MOTION = {
  rise: 16,
  duration: 0.6,
  fade: 0.4,
  stagger: 0.06,
  cardRise: 24,
  contentDelay: 0.15,
  contentStagger: 0.07,
  drawer: 0.35,
  menu: 0.2,
  hoverLift: -2,
  hover: 0.25,
};

/**
 * Overview section stack (dnd-kit, which takes milliseconds and a CSS easing string): rows slide into their new
 * place over `reorder` ms; the dragged row is lifted (scaled up, shadow). Reduced motion = no slide, no lift.
 */
export const SECTION_STACK = { reorder: 250, easing: `cubic-bezier(${EASE.join(', ')})` };

/** Fade-up variants for admin cards; the element's `custom` prop is its stagger index. Reduced motion = fade only. */
export function adminEnter(reduce, { rise = ADMIN_MOTION.rise, stagger = ADMIN_MOTION.stagger, delay = 0 } = {}) {
  return {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: rise },
    visible: (index = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: ADMIN_MOTION.duration,
        ease: EASE,
        delay: delay + index * stagger,
        opacity: { duration: ADMIN_MOTION.fade, ease: EASE, delay: delay + index * stagger },
      },
    }),
  };
}

/** Subtle hover lift for clickable admin tiles (none with reduced motion). */
export function adminHover(reduce) {
  return reduce ? {} : { whileHover: { y: ADMIN_MOTION.hoverLift }, transition: { duration: ADMIN_MOTION.hover, ease: EASE } };
}

export function enterFrom(y, delay = 0) {
  return {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        y: { duration: ENTRANCE.duration, ease: EASE, delay },
        opacity: { duration: ENTRANCE.fade, ease: EASE, delay },
      },
    },
  };
}

/**
 * Reveal variants starting `x`/`y` px away with a fade; the element's `custom` prop is its stagger index.
 * `timing` overrides the base `delay` and the `stagger` between indexes. Reduced motion keeps only the fade.
 */
export function revealFrom({ x = 0, y = 0 } = {}, reduce = false, { delay: baseDelay = 0, stagger = REVEAL.stagger } = {}) {
  return {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, x, y },
    visible: (index = 0) => {
      const delay = baseDelay + index * stagger;
      return {
        opacity: 1,
        x: 0,
        y: 0,
        transition: {
          duration: REVEAL.duration,
          ease: EASE,
          delay,
          opacity: { duration: REVEAL.fade, ease: EASE, delay },
        },
      };
    },
  };
}

/** Returns `(offset, timing) => variants` for children of a section using `whileInView="visible"`. */
export function useReveal() {
  const reduce = useReducedMotion();
  return (offset, timing) => revealFrom(offset, reduce, timing);
}

/** Props for a section that reveals its children once it scrolls into view. */
export const revealOnScroll = {
  initial: 'hidden',
  whileInView: 'visible',
  viewport: { once: true, amount: REVEAL.amount },
};

/** Returns a helper producing entrance props, or no-op props when the user prefers reduced motion. */
export function useEntrance() {
  const reduce = useReducedMotion();
  return (y, delay = 0) =>
    reduce ? {} : { variants: enterFrom(y, delay), initial: 'hidden', animate: 'visible' };
}

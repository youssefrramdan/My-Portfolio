/**
 * Card styles by slot index (slot 1 to 4), from the Figma "Tools Content" frame (184:20778).
 * xl+ (desktop arrangement): tilt -8 / -4 / 4 / 8 deg, outer cards 100px lower, and every card
 * pushed 10px outwards so the middle gap is wider (card centers 311 / 331 / 311px apart).
 * tablet: half the tilt, no vertical offset (no tablet frame in Figma). Mobile: no tilt.
 * With fewer than four cards, the first slots are used in order and the row stays centered.
 */
export const CARD_SLOTS = [
  'tablet:-rotate-4 xl:-rotate-8 xl:mt-25 xl:-translate-x-2.5',
  'tablet:-rotate-2 xl:-rotate-4 xl:-translate-x-2.5',
  'tablet:rotate-2 xl:rotate-4 xl:translate-x-2.5',
  'tablet:rotate-4 xl:rotate-8 xl:mt-25 xl:translate-x-2.5',
];

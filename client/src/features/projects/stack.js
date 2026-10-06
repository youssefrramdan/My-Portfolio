/** Row card width on desktop (`xl:w-116` in Projects.jsx). */
const ROW_CARD_WIDTH = 464;

/**
 * Stack state from the Figma "Selected Projects" Default variant (127:14116, 1440 x 427):
 * the first 4 cards 365 wide (a scaled row card) fanned around 72% of the width,
 * the header top-aligned and the cards centered on y = 208 (section padding 32 excluded below).
 * `x` = each card's offset from the stack center, `rotate` = its tilt (deg), bottom card first.
 */
export const STACK = {
  scale: 365 / ROW_CARD_WIDTH,
  anchorX: 1036.7 / 1440,
  height: 427 - 2 * 32,
  centerY: 208 - 32,
  cards: [
    { x: -11, rotate: -4.44 },
    { x: -4.5, rotate: 1.98 },
    { x: 0, rotate: -3.65 },
    { x: 9.7, rotate: 3.92 },
  ],
};

/** Height of the fixed navbar from tablet up (py-4 + h-13): the sticky stage keeps its content below it. */
export const NAV_HEIGHT = 84;

/**
 * Geometry of the Contact arcs, measured on the Figma frames (desktop 184:20913, mobile 403:12558).
 * Angles are degrees from the top of the circle: negative = left side, positive = right side.
 * - `step`: angular distance between neighbour icons (Figma: 26.1 / 38.9 / 51.6 / 62.4 on each side).
 * - `sideMiddle`: each side's icon group is centered on this angle.
 * - `gap`: the arcs leave the top open (Figma arc data 289.2deg -> 250.7deg).
 * - `faint`: radii of the faint inner arcs, relative to the green arc.
 */
export const ARC = {
  step: 12,
  sideMiddle: 44.3,
  gap: 19.3,
  faint: [0.9, 0.925],
  stroke: 3,
};

/** Desktop arc with icons (xl+): green circle 1179px, its top 56px below the section top. */
export const LARGE_ARC = { radius: 589.5, top: 56, end: 75 };
/** Small arc below xl: 393px circle whose top sits on the buttons row. */
export const SMALL_ARC = { radius: 196.65, top: 0, end: 82 };

/** `{ x, y }` of a point on a circle of `radius` at `angle`, relative to the circle center. */
export function pointAt(angle, radius) {
  const rad = (angle * Math.PI) / 180;
  return { x: radius * Math.sin(rad), y: -radius * Math.cos(rad) };
}

/** Angle of the drawing tip on `side` (-1 left, 1 right) once `progress` (0..1) of the arc is drawn. */
export function tipAngle(progress, arc, side) {
  return side * (arc.end - progress * (arc.end - ARC.gap));
}

/** Draw progress (0..1) at which the drawing tip reaches `angle`. */
export function progressAt(angle, arc) {
  return (arc.end - Math.abs(angle)) / (arc.end - ARC.gap);
}

/**
 * Arc angles for `count` icons, in API order. The left side gets ceil(n/2) icons, the right floor(n/2);
 * icons alternate left/right from the bottom up (index 0 = bottom left, 1 = bottom right, 2 = second left...),
 * and each side's group is centered on `ARC.sideMiddle`, `ARC.step` apart. One icon sits mid-left.
 * Returns `[{ side, row, angle }]` where `row` 0 is the bottom of that side.
 */
export function getArcPositions(count) {
  const perSide = { left: Math.ceil(count / 2), right: Math.floor(count / 2) };
  return Array.from({ length: count }, (_, index) => {
    const side = index % 2 === 0 ? 'left' : 'right';
    const row = Math.floor(index / 2);
    const offset = ((perSide[side] - 1) / 2 - row) * ARC.step;
    const angle = ARC.sideMiddle + offset;
    return { side, row, angle: side === 'left' ? -angle : angle };
  });
}

import { motion, useTransform } from 'framer-motion';
import { CONTACT_MOTION, EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { ARC, getArcPositions, LARGE_ARC, pointAt, progressAt, tipAngle } from './arcLayout';
import SocialIcon from './SocialIcon';

const SIDES = [-1, 1];
const fade = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: CONTACT_MOTION.faintFade, ease: EASE } } };
const faintFade = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: CONTACT_MOTION.faintFade,
      ease: EASE,
      delay: CONTACT_MOTION.delay + CONTACT_MOTION.faintAt * CONTACT_MOTION.draw,
    },
  },
};

/** SVG path from the bottom end of one side (`end` deg) up to the top gap, on a circle centered at `center`. */
function sidePath(radius, side, end, center) {
  const from = pointAt(side * end, radius);
  const to = pointAt(side * ARC.gap, radius);
  const sweep = side < 0 ? 1 : 0;
  return `M ${center + from.x} ${center + from.y} A ${radius} ${radius} 0 0 ${sweep} ${center + to.x} ${center + to.y}`;
}

/** Box of the arc's circle (plus half the stroke), centered horizontally on its parent, `arc.top` px down. */
function arcBox(arc) {
  const size = arc.radius * 2 + ARC.stroke;
  return { size, center: size / 2, style: { width: size, height: size, top: arc.top - ARC.stroke / 2 } };
}

/** Pop-in style for something the drawing tip reaches at `at` (0..1 of `progress`). */
function usePop(progress, at) {
  const range = [Math.max(at - CONTACT_MOTION.iconWindow, 0), at];
  const scale = useTransform(progress, range, [CONTACT_MOTION.iconFrom, 1]);
  const opacity = useTransform(progress, range, [0, 1]);
  return { scale, opacity };
}

/** Glow dot riding the drawing tip of one side; visible only while the arc is drawing. */
function TipDot({ arc, side, center, progress }) {
  const cx = useTransform(progress, (value) => center + pointAt(tipAngle(value, arc, side), arc.radius).x);
  const cy = useTransform(progress, (value) => center + pointAt(tipAngle(value, arc, side), arc.radius).y);
  const opacity = useTransform(progress, [0, 0.04, 0.9, 1], [0, 1, 1, 0]);

  return (
    <motion.g style={{ opacity }}>
      <motion.circle cx={cx} cy={cy} r={6} className="fill-fill-primary blur-xs" />
      <motion.circle cx={cx} cy={cy} r={2.5} className="fill-neutral" />
    </motion.g>
  );
}

/**
 * The green arc and the two faint inner arcs (Figma "Ellipse 3" / "Ellipse 4"), open at the top.
 * Each side is its own path from the bottom end up to the gap, drawn by `progress` (0..1) with a glow dot on
 * its tip; the faint arcs fade in near the end. `reduce`: no drawing, the whole arc fades in.
 */
export function ArcLines({ arc, progress, reduce, className }) {
  const { size, center, style } = arcBox(arc);

  return (
    <motion.svg
      aria-hidden
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      style={style}
      variants={reduce ? fade : undefined}
      className={cn('pointer-events-none absolute left-1/2 -translate-x-1/2 overflow-visible', className)}
    >
      {ARC.faint.map((ratio) =>
        SIDES.map((side) => (
          <motion.path
            key={`${ratio}${side}`}
            d={sidePath(arc.radius * ratio, side, arc.end, center)}
            variants={reduce ? undefined : faintFade}
            className="stroke-fill-primary/10"
            strokeWidth={1}
          />
        )),
      )}
      {SIDES.map((side) => (
        <motion.path
          key={side}
          d={sidePath(arc.radius, side, arc.end, center)}
          style={reduce ? undefined : { pathLength: progress }}
          className="stroke-fill-primary"
          strokeWidth={ARC.stroke}
        />
      ))}
      {!reduce && SIDES.map((side) => <TipDot key={side} arc={arc} side={side} center={center} progress={progress} />)}
    </motion.svg>
  );
}

function ArcIcon({ social, angle, center, progress, reduce }) {
  const point = pointAt(angle, LARGE_ARC.radius);
  const pop = usePop(progress, progressAt(angle, LARGE_ARC));

  return (
    <motion.div
      className="pointer-events-auto absolute -translate-1/2"
      style={{ left: center + point.x, top: center + point.y, ...(reduce ? {} : pop) }}
    >
      <SocialIcon social={social} className="size-13.25" />
    </motion.div>
  );
}

/**
 * Desktop (xl+) social icons placed on the large arc: left side ceil(n/2), right side floor(n/2),
 * API order alternating left/right from the bottom up (see `getArcPositions`). Each icon pops in as the
 * drawing arc reaches it.
 */
export function ArcIcons({ socials, progress, reduce, className }) {
  const { center, style } = arcBox(LARGE_ARC);
  const positions = getArcPositions(socials.length);

  return (
    <motion.div
      style={style}
      variants={reduce ? fade : undefined}
      className={cn('pointer-events-none absolute left-1/2 -translate-x-1/2', className)}
    >
      {socials.map((social, index) => (
        <ArcIcon
          key={social.platform}
          social={social}
          angle={positions[index].angle}
          center={center}
          progress={progress}
          reduce={reduce}
        />
      ))}
    </motion.div>
  );
}

function RowIcon({ social, at, progress, reduce }) {
  const pop = usePop(progress, at);
  return (
    <motion.li style={reduce ? undefined : pop}>
      <SocialIcon social={social} className="size-9" />
    </motion.li>
  );
}

/** Below xl: the icons in one row under the buttons, popping in left to right while the small arc draws. */
export function SocialRow({ socials, progress, reduce, className }) {
  const step = (1 - CONTACT_MOTION.iconWindow) / socials.length;
  return (
    <motion.ul
      aria-label="Social links"
      variants={reduce ? fade : undefined}
      className={cn('relative flex flex-wrap justify-center gap-2', className)}
    >
      {socials.map((social, index) => (
        <RowIcon
          key={social.platform}
          social={social}
          at={CONTACT_MOTION.iconWindow + step * (index + 1)}
          progress={progress}
          reduce={reduce}
        />
      ))}
    </motion.ul>
  );
}

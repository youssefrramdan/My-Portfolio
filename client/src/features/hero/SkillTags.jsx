import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/Icon';
import { DISTANCE, EASE, ENTRANCE, IDLE_EASE, TAG_CYCLE, TAG_FLOAT, useEntrance } from '@/lib/motion';
import { cn } from '@/lib/utils';

/**
 * Slot geometry (px) from the Figma "Skills Content" column (184:20884): the middle tag is
 * full size, the others shrink, fade and blur towards the top and bottom edges.
 * ENTER / EXIT are the off-column positions used when a tag joins at the bottom or leaves at the top.
 */
const SLOTS = [
  { x: 0, y: 0, scale: 0.7, opacity: 0.4, blur: 8 },
  { x: 33, y: 55, scale: 0.8, opacity: 0.6, blur: 4 },
  { x: 52, y: 116, scale: 0.9, opacity: 0.8, blur: 0 },
  { x: 64, y: 182, scale: 1, opacity: 1, blur: 0 },
  { x: 52, y: 254, scale: 0.9, opacity: 0.8, blur: 0 },
  { x: 33, y: 321, scale: 0.8, opacity: 0.6, blur: 4 },
  { x: 0, y: 382, scale: 0.7, opacity: 0.4, blur: 8 },
];
const ENTER = { x: 0, y: 440, scale: 0.6, opacity: 0, blur: 10 };
const EXIT = { x: 0, y: -60, scale: 0.6, opacity: 0, blur: 10 };

// Any non-`none` filter on the wrapper would cancel the pill's backdrop blur, so sharp slots settle on `none`.
const toMotion = ({ x, y, scale, opacity, blur }) => ({
  x,
  y,
  scale,
  opacity,
  filter: `blur(${blur}px)`,
  ...(blur ? {} : { transitionEnd: { filter: 'none' } }),
});

function Tag({ tag, slot, index, reduce }) {
  const { offset, baseDuration, durationStep, phaseStep } = TAG_FLOAT;
  const idle = reduce
    ? {}
    : {
        animate: { y: [0, -offset, 0, offset, 0] },
        transition: {
          duration: baseDuration + (index % SLOTS.length) * durationStep,
          delay: ENTRANCE.duration + (index % SLOTS.length) * phaseStep,
          ease: IDLE_EASE,
          repeat: Infinity,
        },
      };

  return (
    <motion.div
      className="absolute top-0 left-0 origin-left"
      initial={reduce ? false : toMotion(ENTER)}
      animate={toMotion(slot)}
      exit={toMotion(EXIT)}
      transition={{ duration: TAG_CYCLE.duration, ease: EASE }}
    >
      <motion.div
        {...idle}
        className="flex items-center gap-3 rounded-full bg-brand-color-dim/40 px-space-3 py-space-1 backdrop-blur-glass"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-neutral-surface-0">
          <Icon name={tag.icon} nodes={tag.iconNodes} className="text-icon-primary" />
        </span>
        <span className="text-large font-medium whitespace-nowrap text-text-primary">{tag.label}</span>
      </motion.div>
    </motion.div>
  );
}

export default function SkillTags({ skills, className }) {
  const entrance = useEntrance();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const count = skills?.length ?? 0;

  useEffect(() => {
    if (reduce || count < 2) return undefined;
    const id = setInterval(() => setStep((value) => value + 1), TAG_CYCLE.interval);
    return () => clearInterval(id);
  }, [reduce, count]);

  if (!count) return null;

  // Slot `s` shows skill `(s + step) % count`; the lap number in the key makes a skill that wraps
  // around leave at the top and re-enter from the bottom instead of sliding back across the column.
  const visible = Array.from({ length: Math.min(SLOTS.length, count) }, (_, s) => {
    const position = s + step;
    const index = position % count;
    return { tag: skills[index], slot: SLOTS[s], index, key: `${index}-${Math.floor(position / count)}` };
  });

  return (
    <motion.div
      {...entrance(DISTANCE.cards)}
      className={cn('pointer-events-none absolute h-105 w-89 mask-y-from-90%', className)}
    >
      <AnimatePresence initial={false}>
        {visible.map(({ tag, slot, index, key }) => (
          <Tag key={key} tag={tag} slot={slot} index={index} reduce={reduce} />
        ))}
      </AnimatePresence>
    </motion.div>
  );
}

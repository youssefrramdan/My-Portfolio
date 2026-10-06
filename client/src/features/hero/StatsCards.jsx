import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { DISTANCE, ENTRANCE, IDLE_EASE, ODOMETER, STAT_FLOAT, useEntrance } from '@/lib/motion';
import { cn } from '@/lib/utils';
import AnimatedNumber from './AnimatedNumber';

/**
 * Card slots relative to the character image (Figma 403:3115 mobile / 184:20705 desktop).
 * Mobile + tablet: spread along the bottom. xl+: stacked diagonally on the right. The 4th slot (not in Figma)
 * sits top-right on mobile and bottom-left of the image on xl+, away from the capability tags.
 */
const SLOTS = [
  { position: 'left-1/3 top-2/5 xl:left-7/9 xl:-top-8', rotate: 'rotate-0 xl:-rotate-8' },
  { position: 'left-2/3 top-3/5 xl:left-10/11 xl:top-1/5', rotate: 'rotate-20 xl:rotate-15' },
  { position: '-left-2 top-2/3 xl:left-5/6 xl:top-5/9', rotate: '-rotate-10 xl:-rotate-7' },
  { position: 'left-2/3 -top-4 xl:-left-8 xl:top-3/5', rotate: 'rotate-6 xl:rotate-8' },
];

const random = (range) => (Math.random() * 2 - 1) * range;

function createFloat() {
  const { offset, rotate, minDuration, maxDuration, points } = STAT_FLOAT;
  const path = (range) => [0, ...Array.from({ length: points - 1 }, () => random(range)), 0];
  return {
    animate: { x: path(offset), y: path(offset), rotate: path(rotate) },
    transition: {
      duration: minDuration + Math.random() * (maxDuration - minDuration),
      delay: ENTRANCE.duration + Math.random(),
      ease: IDLE_EASE,
      repeat: Infinity,
    },
  };
}

function StatCard({ stat, slot, index }) {
  const entrance = useEntrance();
  const reduce = useReducedMotion();
  const [float] = useState(createFloat);

  return (
    <motion.div
      {...entrance(DISTANCE.cards, index * ENTRANCE.stagger)}
      className={cn('absolute origin-top-left scale-78 tablet:scale-100', slot.position)}
    >
      <motion.div {...(reduce ? {} : float)}>
        <article
          className={cn(
            'flex w-34 flex-col items-center gap-6 rounded-lg bg-brand-color-dim/40 p-4 backdrop-blur-glass',
            slot.rotate,
          )}
        >
          <span className="rounded-full bg-neutral-surface-0/50 px-5 py-1 text-extra-small text-text-primary">
            {stat.label}
          </span>
          <div className="flex w-full flex-col items-start">
            <p className="flex items-center text-h5 font-bold text-text-primary">
              <AnimatedNumber value={stat.number} delay={ODOMETER.delay + index * ENTRANCE.stagger} />
              {stat.suffix && (
                <span className="px-0.75 text-h6 font-regular text-text-secondary">{stat.suffix}</span>
              )}
            </p>
            <p className="text-extra-small whitespace-nowrap text-text-secondary">{stat.title}</p>
          </div>
        </article>
      </motion.div>
    </motion.div>
  );
}

export default function StatsCards({ stats, className }) {
  if (!stats?.length) return null;

  return (
    <div className={cn('pointer-events-none absolute inset-0', className)}>
      {stats.slice(0, SLOTS.length).map((stat, index) => (
        <StatCard key={`${stat.label}-${stat.title}`} stat={stat} slot={SLOTS[index]} index={index} />
      ))}
    </div>
  );
}

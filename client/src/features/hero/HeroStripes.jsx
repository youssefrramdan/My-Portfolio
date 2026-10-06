import { motion } from 'framer-motion';
import { DISTANCE, useEntrance } from '@/lib/motion';
import { cn } from '@/lib/utils';

const COLUMNS = 8;

/** Vertical gradient stripes behind the hero (Figma "Header" group). */
export default function HeroStripes() {
  const entrance = useEntrance();

  return (
    <motion.div
      aria-hidden
      {...entrance(DISTANCE.stripes)}
      className="pointer-events-none absolute inset-x-0 top-3.5 flex justify-center gap-3 tablet:gap-5 xl:top-27.5 xl:gap-7.5"
    >
      {Array.from({ length: COLUMNS }, (_, index) => (
        <span
          key={index}
          className={cn(
            'h-195 w-14 shrink-0 bg-linear-to-b from-transparent via-brand-color/5 to-transparent tablet:w-20 xl:h-180 xl:w-34',
            index >= 6 && 'hidden tablet:block',
          )}
        />
      ))}
    </motion.div>
  );
}

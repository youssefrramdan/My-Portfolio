import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminHover } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from './buttonStyles';

const MotionLink = motion.create(Link);

/** Content library tile: icon, label, count and an arrow. Without `to` it is a plain, non-clickable tile. */
export default function ContentTile({ icon: Icon, label, meta, note, to }) {
  const reduce = useReducedMotion();
  const Component = to ? MotionLink : 'div';
  const linkProps = to ? { to, ...adminHover(reduce) } : {};

  return (
    <Component
      {...linkProps}
      className={cn(
        'group flex items-center gap-4 rounded-lg bg-neutral-surface-raised p-4',
        to && cn('transition-colors hover:bg-neutral-surface-control/60', FOCUS_RING),
      )}
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-tile bg-neutral-surface-control text-text-brand">
        <Icon aria-hidden className="size-5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-small font-semi-bold text-text-primary">{label}</span>
        <span className="truncate text-extra-small text-neutral-text-label">{meta}</span>
        {note && <span className="truncate text-extra-small text-status-warning">{note}</span>}
      </span>
      {to && (
        <ArrowRight
          aria-hidden
          className="size-4.5 shrink-0 text-neutral-text-placeholder transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:text-text-brand xl:max-desktop:hidden"
        />
      )}
    </Component>
  );
}

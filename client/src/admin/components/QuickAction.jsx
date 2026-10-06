import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminHover } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from './buttonStyles';

const MotionLink = motion.create(Link);

/**
 * Quick action tile. `to` = admin route; `href` = external page opened in a new tab.
 * Between 1280 and 1535 the row shares its width with the Publish status card, so the arrow is hidden there.
 */
export default function QuickAction({ icon: Icon, title, subtitle, to, href }) {
  const reduce = useReducedMotion();
  const linkProps = href ? { href, target: '_blank', rel: 'noopener noreferrer' } : { to };
  const Component = href ? motion.a : MotionLink;

  return (
    <Component
      {...linkProps}
      {...adminHover(reduce)}
      className={cn(
        'group flex items-center gap-4 rounded-lg bg-neutral-surface-raised p-5 transition-colors hover:bg-neutral-surface-control/60',
        FOCUS_RING,
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-tile bg-neutral-surface-control text-text-brand">
        <Icon aria-hidden className="size-4.5" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="truncate text-extra-small font-semi-bold text-text-primary">{title}</span>
        <span className="text-extra-small text-neutral-text-label">{subtitle}</span>
      </span>
      <ArrowRight
        aria-hidden
        className="size-4 shrink-0 text-neutral-text-placeholder transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:text-text-brand xl:max-2xl:hidden"
      />
    </Component>
  );
}

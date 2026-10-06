import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cldUrl } from '@/lib/cloudinary';
import { adminHover } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from './buttonStyles';

const MotionLink = motion.create(Link);
const COVER_WIDTH = 800;

/** Recent work card: dimmed cover, index, title + first tag, arrow. Items not on the site get a small badge. */
export default function WorkCard({ index, project, to, labels }) {
  const reduce = useReducedMotion();
  const title = project.title || labels.untitled;

  return (
    <MotionLink
      to={to}
      aria-label={labels.editLabel(title)}
      {...adminHover(reduce)}
      className={cn('group flex flex-col overflow-hidden rounded-lg bg-neutral-surface-raised', FOCUS_RING)}
    >
      <span className="relative block h-36 bg-neutral-surface-control">
        {project.coverImage?.url && (
          <img
            src={cldUrl(project.coverImage.url, { width: COVER_WIDTH })}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover opacity-75 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
        {!project.isLive && (
          <span className="absolute top-3 left-3 rounded-full bg-bg-primary/80 px-2.5 py-1 text-extra-small font-semi-bold text-status-warning">
            {labels.hidden}
          </span>
        )}
      </span>
      <span className="flex items-center gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-neutral-surface-control text-extra-small font-bold text-text-brand">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-extra-small font-semi-bold text-text-primary">{title}</span>
          <span className="truncate text-extra-small text-neutral-text-label">{project.subtitle}</span>
        </span>
        <ArrowRight
          aria-hidden
          className="size-4 shrink-0 text-neutral-text-label transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:text-text-brand"
        />
      </span>
    </MotionLink>
  );
}

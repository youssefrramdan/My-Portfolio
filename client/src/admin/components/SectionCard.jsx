import { motion, useReducedMotion } from 'framer-motion';
import { useId } from 'react';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';

export const EYEBROW = 'text-extra-small font-semi-bold tracking-widest text-neutral-text-label uppercase';

/**
 * Dashboard card (Figma: #1c1e1c, radius 30, padding 28) with an optional eyebrow + title header and an
 * `action` on the right. Fades up on mount; `index` is its place in the page stagger.
 * Without a `title`, the eyebrow becomes the section heading. `icon` (a lucide component) adds the icon tile of
 * the Identity cards and `description` a line under the title.
 */
export default function SectionCard({ eyebrow, title, description, icon: Icon, action, index = 0, className, children }) {
  const reduce = useReducedMotion();
  const headingId = useId();
  const hasHeader = eyebrow || title || action;

  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-labelledby={eyebrow || title ? headingId : undefined}
      className={cn('flex min-w-0 flex-col rounded-card bg-neutral-surface-0 p-5 tablet:p-7', className)}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-3">
          {title ? (
            <div className="flex min-w-0 items-start gap-4">
              {Icon && (
                <span
                  aria-hidden
                  className="flex size-10 shrink-0 items-center justify-center rounded-md bg-neutral-surface-control text-text-brand"
                >
                  <Icon className="size-4.5" />
                </span>
              )}
              <div className="flex min-w-0 flex-col gap-1.5">
                {eyebrow && <p className={EYEBROW}>{eyebrow}</p>}
                <h2 id={headingId} className="text-large font-bold text-neutral-text-heading">
                  {title}
                </h2>
                {description && <p className="text-extra-small text-neutral-text-label">{description}</p>}
              </div>
            </div>
          ) : (
            eyebrow && (
              <h2 id={headingId} className={EYEBROW}>
                {eyebrow}
              </h2>
            )
          )}
          {action}
        </header>
      )}
      {children}
    </motion.section>
  );
}

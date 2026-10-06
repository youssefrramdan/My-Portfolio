import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Chip from '@/components/ui/Chip';
import { cldUrl } from '@/lib/cloudinary';
import { PROJECT_HOVER } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { PROJECT_TEXT } from './labels';

const hoverLift = { y: PROJECT_HOVER.lift };
const hoverTransition = { duration: PROJECT_HOVER.duration, ease: PROJECT_HOVER.ease };

/** Tags shown on a card; the rest collapse into a "+N" chip (the project page lists them all). */
const CARD_TAGS = 2;

const COVER_WIDTHS = [480, 640, 960, 1392];
/** Rendered cover widths: 320 (mobile row), 384 or half the screen (tablet row / grid), up to 464 (desktop). */
const COVER_SIZES = '(min-width: 80rem) 464px, (min-width: 48rem) 50vw, 320px';

/**
 * The card's call to action: always the project page, over the page the card is on (`state.backdrop`). Its `::after`
 * covers the whole card so the card is clickable, while the accessible name stays the short CTA label + project
 * title. `preview` (dashboard) renders the same look without a link.
 */
function CardLink({ project, label, preview }) {
  const { pathname } = useLocation();
  const className =
    'flex items-center gap-1 text-extra-small text-text-brand outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-brand-color';
  const arrow = <ArrowRight aria-hidden className="size-3.5" />;

  if (preview) {
    return (
      <span className={className}>
        {label}
        {arrow}
      </span>
    );
  }
  return (
    <Link to={`/projects/${project.slug}`} state={{ backdrop: pathname }} draggable={false} className={className}>
      {label}
      <span className="sr-only">: {project.title}</span>
      {arrow}
    </Link>
  );
}

/**
 * Project card (Figma "Project" component): cover with the year pill, title, description, CTA and tags.
 * The hover (5px lift + green border) lives here; position and reveal props go on a wrapper.
 * The link text is the project's own `cardLabel`, else `ctaLabel` (the section's default card link text).
 */
export default function ProjectCard({ project, ctaLabel, preview = false, className }) {
  const reduce = useReducedMotion();
  const label = project.cardLabel?.trim() || ctaLabel;
  const tags = project.tags ?? [];
  const hiddenTags = tags.slice(CARD_TAGS);
  const cover = project.coverImage;

  return (
    <motion.article
      whileHover={reduce ? undefined : hoverLift}
      transition={hoverTransition}
      className={cn('group relative flex h-full flex-col overflow-hidden rounded-xl bg-neutral-surface-0', className)}
    >
      <div className="relative aspect-416/220 shrink-0 overflow-hidden bg-neutral-surface-2">
        {cover?.url && (
          <img
            src={cldUrl(cover.url, { width: 960 })}
            srcSet={COVER_WIDTHS.map((width) => `${cldUrl(cover.url, { width })} ${width}w`).join(', ')}
            sizes={COVER_SIZES}
            alt={cover.alt ?? ''}
            width={416}
            height={220}
            loading="lazy"
            decoding="async"
            draggable={false}
            className="size-full object-cover"
          />
        )}
        {project.year && (
          <span className="absolute top-space-2 right-space-2 rounded-full bg-neutral-surface-2 px-space-2 py-space-1 text-extra-small text-text-primary">
            {project.year}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-space-1 px-space-3 py-space-2">
        <h3 className="line-clamp-1 text-large font-bold text-text-primary">{project.title}</h3>
        <p className="line-clamp-2 text-small text-text-secondary">{project.description}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-space-1">
          {label && <CardLink project={project} label={label} preview={preview} />}
          {tags.length > 0 && (
            <ul className="flex flex-wrap justify-end gap-1">
              {tags.slice(0, CARD_TAGS).map((tag, index) => (
                <li key={`${tag.label}-${index}`} className="flex">
                  <Chip size="sm">{tag.label}</Chip>
                </li>
              ))}
              {hiddenTags.length > 0 && (
                <li className="flex">
                  <Chip size="sm">
                    <span aria-hidden>+{hiddenTags.length}</span>
                    <span className="sr-only">{PROJECT_TEXT.moreTags(hiddenTags.map((tag) => tag.label))}</span>
                  </Chip>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* Figma "inside" stroke: drawn above the cover, which would hide an inset ring on the card itself. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-transparent ring-inset transition-shadow duration-300 ease-out group-hover:ring-brand-color"
      />
    </motion.article>
  );
}

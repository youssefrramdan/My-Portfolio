import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminEnter, adminHover } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from '../../components/buttonStyles';
import ErrorState from '../../components/ErrorState';
import SectionCard from '../../components/SectionCard';
import Skeleton from '../../components/Skeleton';
import { useOverview } from '../../hooks/useOverview';
import { CONTENT_TILES, pendingLabel, tileCount } from '../../lib/contentLibrary';
import { CONTENT } from './constants';

const MotionLink = motion.create(Link);

/** `/admin/content`: what the library holds, one tile per content type (counts from the Overview data). */
export default function ContentPage() {
  const { data, isPending, isError, isFetching, refetch } = useOverview();
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col">
      <motion.div variants={adminEnter(reduce)} initial="hidden" animate="visible" className="flex flex-col gap-2">
        <p className="text-extra-small font-semi-bold tracking-widest text-text-brand uppercase">{CONTENT.eyebrow}</p>
        <h2 className="text-h4 font-black tracking-tight text-neutral-text-heading">{CONTENT.title}</h2>
        <p className="text-small text-neutral-text-label">{CONTENT.subtitle}</p>
      </motion.div>

      <SectionCard index={1} className="relative isolate mt-7 overflow-hidden tablet:p-9">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-16 right-8 -z-10 size-42 rounded-full bg-neutral/15 blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -top-6 right-28 -z-10 size-42 rounded-full bg-brand-color/30 blur-3xl"
        />
        <span className="inline-flex items-center gap-2 self-start rounded-full bg-neutral-surface-control px-3 py-1.5 text-extra-small font-medium text-text-brand uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-fill-primary" />
          {CONTENT.hero.badge}
        </span>
        <h3 className="mt-5 text-h5 font-black text-neutral-text-heading">
          {CONTENT.hero.plain} <span className="text-text-brand">{CONTENT.hero.highlight}</span>
        </h3>
        <p className="mt-4 max-w-160 text-small text-neutral-text-label">{CONTENT.hero.text}</p>

        <h4 className="sr-only">{CONTENT.tiles}</h4>
        {isPending ? (
          <div className="mt-8 grid grid-cols-2 gap-3 tablet:grid-cols-3 xl:grid-cols-5">
            {CONTENT_TILES.map((tile) => (
              <Skeleton key={tile.key} className="h-44 rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState
            title={CONTENT.error.title}
            message={CONTENT.error.message}
            retryLabel={CONTENT.error.retry}
            onRetry={() => refetch()}
            retrying={isFetching}
            className="mt-8"
          />
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-3 tablet:grid-cols-3 xl:grid-cols-5">
            {CONTENT_TILES.map((tile) => (
              <li key={tile.key} className="flex">
                <LibraryTile
                  tile={tile}
                  meta={tile.unit(tileCount(data, tile.key))}
                  note={tile.key === 'testimonials' && data.counts.pendingTestimonials ? pendingLabel(data.counts.pendingTestimonials) : null}
                />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      <SectionCard index={2} className="mt-5 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-6">
        <div className="flex flex-col gap-1.5">
          <h2 className="text-large font-bold text-neutral-text-heading">{CONTENT.connect.title}</h2>
          <p className="text-extra-small text-neutral-text-label">{CONTENT.connect.text}</p>
        </div>
        <Link
          to={CONTENT.connect.to}
          className={cn(
            'group mt-4 inline-flex items-center gap-1.5 self-start rounded-sm text-small font-semi-bold text-text-brand tablet:mt-0 tablet:self-auto',
            FOCUS_RING,
          )}
        >
          {CONTENT.connect.action}
          <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </SectionCard>
    </div>
  );
}

/** Figma "content type" tile: icon, label, count + arrow. Types without a page yet are not clickable. */
function LibraryTile({ tile, meta, note }) {
  const reduce = useReducedMotion();
  const Icon = tile.icon;
  const Component = tile.to ? MotionLink : 'div';
  const linkProps = tile.to ? { to: tile.to, ...adminHover(reduce) } : {};

  return (
    <Component
      {...linkProps}
      className={cn(
        'group flex min-h-44 w-full flex-col justify-between gap-6 rounded-lg bg-neutral-surface-raised p-5',
        tile.to && cn('transition-colors hover:bg-neutral-surface-control/60', FOCUS_RING),
      )}
    >
      <span className="flex size-11 items-center justify-center rounded-tile bg-neutral-surface-control text-text-brand">
        <Icon aria-hidden className="size-5" />
      </span>
      <span className="flex flex-col gap-1.5">
        <span className="text-small font-semi-bold text-text-primary">{tile.label}</span>
        <span className="flex items-center justify-between gap-2">
          <span className="text-extra-small text-neutral-text-label">{meta}</span>
          {tile.to && (
            <ArrowRight
              aria-hidden
              className="size-4 shrink-0 text-neutral-text-placeholder transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:text-text-brand"
            />
          )}
        </span>
        {note && <span className="text-extra-small text-status-warning">{note}</span>}
        {!tile.to && <span className="text-extra-small text-neutral-text-placeholder">{CONTENT.soon}</span>}
      </span>
    </Component>
  );
}

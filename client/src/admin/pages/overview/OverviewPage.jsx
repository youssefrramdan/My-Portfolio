import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Eye, FolderPlus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../../components/buttonStyles';
import Checklist from '../../components/Checklist';
import ContentTile from '../../components/ContentTile';
import ErrorState from '../../components/ErrorState';
import PercentChip from '../../components/PercentChip';
import PublishButton from '../../components/PublishButton';
import PublishStatusCard from '../../components/PublishStatusCard';
import QuickAction from '../../components/QuickAction';
import SectionCard, { EYEBROW } from '../../components/SectionCard';
import SectionStack from '../../components/SectionStack';
import Skeleton from '../../components/Skeleton';
import WorkCard from '../../components/WorkCard';
import { useMe } from '../../hooks/useAuth';
import { useOverview } from '../../hooks/useOverview';
import { CONTENT_TILES, pendingLabel, tileCount } from '../../lib/contentLibrary';
import { firstName } from '../../lib/format';
import { OVERVIEW, QUICK_ACTIONS } from './constants';

export default function OverviewPage() {
  const { data: user } = useMe();
  const { data, isPending, isError, isFetching, refetch } = useOverview();
  const reduce = useReducedMotion();

  return (
    <div className="flex flex-col">
      <motion.div variants={adminEnter(reduce)} initial="hidden" animate="visible" className="flex flex-col gap-2">
        <p className="text-extra-small font-semi-bold tracking-widest text-text-brand uppercase">{OVERVIEW.eyebrow}</p>
        <h2 className="text-h4 font-black tracking-tight text-neutral-text-heading">
          {OVERVIEW.welcome(firstName(user?.name))}
        </h2>
        <p className="text-small text-neutral-text-label">{OVERVIEW.subtitle}</p>
      </motion.div>

      {isPending ? (
        <OverviewSkeleton />
      ) : isError ? (
        <ErrorState
          title={OVERVIEW.error.title}
          message={OVERVIEW.error.message}
          retryLabel={OVERVIEW.error.retry}
          onRetry={() => refetch()}
          retrying={isFetching}
          className="mt-7"
        />
      ) : (
        <OverviewContent data={data} />
      )}
    </div>
  );
}

function OverviewContent({ data }) {
  const { counts, setup, sections, recentWork, site } = data;
  const isReady = setup.percent === 100;
  const headline = isReady ? OVERVIEW.health.ready : OVERVIEW.health.almost;
  return (
    <>
      <div className="mt-7 grid gap-5 xl:grid-cols-8">
        <SectionCard index={1} className="relative isolate overflow-hidden tablet:p-9 xl:col-span-5">
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
            {OVERVIEW.health.badge}
          </span>
          <h3 className="mt-5 text-h5 font-black text-neutral-text-heading">
            {headline.plain}
            <br />
            <span className="text-text-brand">{headline.highlight}</span>
          </h3>
          <p className="mt-4 max-w-127.5 text-small text-neutral-text-label">
            {isReady ? OVERVIEW.health.readyText : OVERVIEW.health.almostText}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <PublishButton label={OVERVIEW.health.publish} />
            <a
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className={adminButton({ variant: 'secondary' })}
            >
              <Eye aria-hidden className="size-4.5" />
              {OVERVIEW.health.preview}
            </a>
          </div>
        </SectionCard>

        <SectionCard index={2} className="xl:col-span-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <h2 className={EYEBROW}>{OVERVIEW.setup.eyebrow}</h2>
              <p className="text-h5 font-black text-neutral-text-heading">
                <span className="sr-only">{OVERVIEW.setup.progressLabel(setup.done, setup.total)}</span>
                <span aria-hidden>
                  {setup.done}
                  <span className="text-neutral-text-placeholder">/{setup.total}</span>
                </span>
              </p>
            </div>
            <PercentChip percent={setup.percent} />
          </div>
          <div className="mt-6">
            <Checklist items={setup.items} doneLabel={OVERVIEW.setup.doneLabel} todoLabel={OVERVIEW.setup.todoLabel} />
          </div>
        </SectionCard>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2 2xl:grid-cols-7">
        <SectionCard
          index={3}
          eyebrow={OVERVIEW.library.eyebrow}
          title={OVERVIEW.library.title}
          className="2xl:col-span-3"
          action={
            <Link
              to={OVERVIEW.library.addTo}
              aria-label={OVERVIEW.library.add}
              className={adminButton({ variant: 'secondary', size: 'icon', className: 'text-text-brand' })}
            >
              <Plus aria-hidden className="size-5" />
            </Link>
          }
        >
          <div className="mt-6 grid gap-2 tablet:grid-cols-2">
            {CONTENT_TILES.map((tile) => (
              <ContentTile
                key={tile.key}
                icon={tile.icon}
                label={tile.label}
                meta={tile.unit(tileCount(data, tile.key))}
                note={tile.key === 'testimonials' && counts.pendingTestimonials ? pendingLabel(counts.pendingTestimonials) : null}
                to={tile.to}
              />
            ))}
          </div>
        </SectionCard>

        <SectionStack
          index={4}
          sections={sections}
          labels={OVERVIEW.stack}
          className="2xl:col-span-4"
          action={<TextLink to={OVERVIEW.stack.editTo}>{OVERVIEW.stack.edit}</TextLink>}
        />
      </div>

      <SectionCard
        index={5}
        eyebrow={OVERVIEW.recent.eyebrow}
        title={OVERVIEW.recent.title}
        className="mt-5"
        action={
          <Link to={OVERVIEW.recent.addTo} className={adminButton({ size: 'sm' })}>
            <Plus aria-hidden className="size-4.5" />
            {OVERVIEW.recent.add}
          </Link>
        }
      >
        {recentWork.length ? (
          <ul className="mt-6 grid gap-3 tablet:grid-cols-3">
            {recentWork.map((project, index) => (
              <li key={project._id}>
                <WorkCard index={index} project={project} to={OVERVIEW.recent.editTo(project._id)} labels={OVERVIEW.recent} />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyWork />
        )}
      </SectionCard>

      <div className="mt-5 grid gap-5 xl:grid-cols-3 2xl:grid-cols-4">
        <SectionCard index={6} eyebrow={OVERVIEW.quick.eyebrow} className="xl:col-span-2 2xl:col-span-3">
          <ul className="mt-4 grid gap-2 tablet:grid-cols-3">
            {QUICK_ACTIONS.map((action) => (
              <li key={action.key}>
                <QuickAction
                  icon={action.icon}
                  title={action.title}
                  subtitle={action.subtitle}
                  to={action.to}
                  href={action.preview ? site.url : undefined}
                />
              </li>
            ))}
          </ul>
        </SectionCard>
        <PublishStatusCard index={7} site={site} />
      </div>
    </>
  );
}

function TextLink({ to, children }) {
  return (
    <Link
      to={to}
      className={cn(
        'group inline-flex shrink-0 items-center gap-2 rounded-sm text-base font-medium text-text-brand',
        FOCUS_RING,
      )}
    >
      {children}
      <ArrowRight aria-hidden className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
    </Link>
  );
}

function EmptyWork() {
  return (
    <div className="mt-6 flex flex-col items-start gap-4 rounded-lg bg-neutral-surface-raised p-6 tablet:flex-row tablet:items-center">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-tile bg-neutral-surface-control text-text-brand">
        <FolderPlus aria-hidden className="size-5" />
      </span>
      <div className="flex flex-1 flex-col gap-1">
        <p className="text-small font-semi-bold text-text-primary">{OVERVIEW.recent.emptyTitle}</p>
        <p className="text-extra-small text-neutral-text-label">{OVERVIEW.recent.emptyText}</p>
      </div>
      <Link to={OVERVIEW.recent.addTo} className={adminButton({ size: 'sm' })}>
        <Plus aria-hidden className="size-4.5" />
        {OVERVIEW.recent.add}
      </Link>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div role="status" className="mt-7 flex flex-col gap-5">
      <div className="grid gap-5 xl:grid-cols-8">
        <Skeleton className="h-100 rounded-card xl:col-span-5" />
        <Skeleton className="h-100 rounded-card xl:col-span-3" />
      </div>
      <div className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-7">
        <Skeleton className="h-96 rounded-card 2xl:col-span-3" />
        <Skeleton className="h-96 rounded-card 2xl:col-span-4" />
      </div>
      <Skeleton className="h-80 rounded-card" />
    </div>
  );
}

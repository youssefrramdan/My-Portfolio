import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, CircleCheck, Eye, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../../components/buttonStyles';
import { EDITOR_GRID } from '../../components/content/ContentEditorFrame';
import ErrorState from '../../components/ErrorState';
import SectionCard from '../../components/SectionCard';
import SectionStack from '../../components/SectionStack';
import Skeleton from '../../components/Skeleton';
import { useOverview } from '../../hooks/useOverview';
import { usePageState } from '../../hooks/usePageLayout';
import { CAPABILITIES_PATH, CONTACT_PATH, CREDENTIALS_PATH, TESTIMONIALS_PATH, WORK_PATH } from '../../lib/contentLibrary';
import { PAGE } from './constants';

/** Where the content of each section is edited. */
const SOURCE_PATHS = {
  hero: '/admin/identity',
  skills: CAPABILITIES_PATH,
  projects: WORK_PATH,
  education: CREDENTIALS_PATH,
  testimonials: TESTIMONIALS_PATH,
  contact: CONTACT_PATH,
};

/** `/admin/page` (Figma 546:16219): the home section stack with navbar labels, page health and publish checks. */
export default function PagePage() {
  const reduce = useReducedMotion();
  const { data, isPending, isError, isFetching, refetch } = usePageState();

  return (
    <div className="flex flex-col">
      <motion.div variants={adminEnter(reduce)} initial="hidden" animate="visible" className="flex flex-col gap-2">
        <p className="text-extra-small font-semi-bold tracking-widest text-text-brand uppercase">{PAGE.eyebrow}</p>
        <h2 className="text-h4 font-black tracking-tight text-neutral-text-heading">{PAGE.title}</h2>
        <p className="text-small text-neutral-text-label">{PAGE.subtitle}</p>
      </motion.div>

      <SectionCard index={1} className="relative isolate mt-7 overflow-hidden tablet:p-9">
        <span aria-hidden className="pointer-events-none absolute -top-4 right-16 -z-10 size-42 rounded-full bg-neutral/15 blur-3xl" />
        <span aria-hidden className="pointer-events-none absolute -top-10 right-8 -z-10 size-42 rounded-full bg-brand-color/30 blur-3xl" />
        <span className="inline-flex items-center gap-2 self-start rounded-full bg-neutral-surface-control px-3 py-1.5 text-extra-small font-medium text-text-brand uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-fill-primary" />
          {PAGE.hero.badge}
        </span>
        <h3 className="mt-5 text-h5 font-black text-neutral-text-heading">
          {PAGE.hero.plain} <span className="text-text-brand">{PAGE.hero.highlight}</span>
        </h3>
        <p className="mt-4 max-w-168 text-small text-neutral-text-label">{PAGE.hero.text}</p>
      </SectionCard>

      {isPending ? (
        <div role="status" className={cn(EDITOR_GRID, 'mt-5')}>
          <Skeleton className="h-170 rounded-card" />
          <Skeleton className="h-80 rounded-card" />
        </div>
      ) : isError ? (
        <ErrorState
          title={PAGE.error.title}
          message={PAGE.error.message}
          retryLabel={PAGE.error.retry}
          onRetry={() => refetch()}
          retrying={isFetching}
          className="mt-5"
        />
      ) : (
        <div className={cn(EDITOR_GRID, 'mt-5')}>
          <SectionStack
            index={2}
            sections={data.sections}
            labels={PAGE.stack}
            detailed
            className="xl:self-start"
            action={<span className="text-extra-small text-neutral-text-label">{PAGE.stack.count(data.sections.length)}</span>}
          />
          <aside className="flex min-w-0 flex-col gap-5">
            <HealthCard index={3} state={data} />
            <ValidationCard index={4} state={data} />
          </aside>
        </div>
      )}
    </div>
  );
}

function HealthCard({ index, state }) {
  const { data: overview } = useOverview();
  const siteUrl = overview?.site.url;
  const visible = state.sections.filter((section) => section.isVisible).length;
  const warnings = state.problems.length;

  return (
    <SectionCard index={index} className="gap-4 p-5 tablet:p-5">
      <h2 className="text-small font-semi-bold text-neutral-text-heading">{PAGE.health.eyebrow}</h2>
      <dl className="grid grid-cols-2 gap-2">
        <div className="flex flex-col-reverse gap-1 rounded-lg bg-neutral-surface-raised p-4">
          <dt className="text-extra-small text-neutral-text-label">{PAGE.health.visible}</dt>
          <dd className="text-h5 font-black text-neutral-text-heading tabular-nums">{visible}</dd>
        </div>
        <div className="flex flex-col-reverse gap-1 rounded-lg bg-neutral-surface-raised p-4">
          <dt className="text-extra-small text-neutral-text-label">{PAGE.health.warnings}</dt>
          <dd className={cn('text-h5 font-black tabular-nums', warnings ? 'text-status-warning' : 'text-neutral-text-heading')}>{warnings}</dd>
        </div>
      </dl>
      <a
        href={siteUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-disabled={!siteUrl || undefined}
        className={adminButton({ variant: 'secondary', className: cn('w-full', !siteUrl && 'pointer-events-none opacity-60') })}
      >
        <Eye aria-hidden className="size-4" />
        {PAGE.health.preview}
      </a>
    </SectionCard>
  );
}

function ValidationCard({ index, state }) {
  const reduce = useReducedMotion();
  const { problems, sections } = state;
  const sourceOf = (key) => sections.find((section) => section.key === key)?.source ?? key;
  const ok = problems.length === 0;
  const Icon = ok ? CircleCheck : ShieldAlert;

  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-labelledby="page-validation-title"
      className="flex min-w-0 flex-col gap-4 rounded-card bg-neutral-surface-0 p-5"
    >
      <div className="flex items-start gap-3">
        <Icon aria-hidden className={cn('mt-px size-4 shrink-0', ok ? 'text-text-brand' : 'text-status-warning')} />
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id="page-validation-title" className="text-small font-semi-bold text-neutral-text-heading">
            {PAGE.validation.title}
          </h2>
          <p className="text-extra-small text-neutral-text-label">{ok ? PAGE.validation.ok : PAGE.validation.text}</p>
        </div>
      </div>
      {!ok && (
        <ul className="flex flex-col gap-2">
          {problems.map((problem) => (
            <li key={`${problem.key}-${problem.kind}-${problem.message}`} className="flex flex-col gap-2 rounded-md bg-status-warning/6 px-4 py-3">
              <p className="text-extra-small text-status-warning">
                <span className="font-semi-bold">{sourceOf(problem.key)}: </span>
                {problem.message}
              </p>
              <Link
                to={SOURCE_PATHS[problem.key]}
                className={cn(
                  'group inline-flex items-center gap-1.5 self-start rounded-sm text-extra-small font-semi-bold text-text-brand',
                  FOCUS_RING,
                )}
              >
                {PAGE.validation.edit(sourceOf(problem.key))}
                <ArrowRight aria-hidden className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </motion.section>
  );
}

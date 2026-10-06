import { arrayMove } from '@dnd-kit/sortable';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, FolderPlus, ImageOff, LoaderCircle, Plus, Search } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FIELD_CONTROL } from '@/components/ui/fieldStyles';
import { cldUrl } from '@/lib/cloudinary';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../../components/buttonStyles';
import ErrorState from '../../components/ErrorState';
import { EYEBROW } from '../../components/SectionCard';
import Skeleton from '../../components/Skeleton';
import SortableList, { SortableRow } from '../../components/SortableList';
import { useCreateWork, useReorderWork, useWorkList } from '../../hooks/useWork';
import { WORK_LIST as COPY, workEditPath } from './constants';
import SectionHeadingCard from './SectionHeadingCard';
import WorkStatusBadge from './WorkStatusBadge';

const matches = (item, query) => {
  const { title, description, tags, client, role } = item.work;
  return [title, description, client, role, ...tags].some((value) => value?.toLowerCase().includes(query));
};

/** `/admin/content/work`: the Work library: heading of the home section, then every item (drag to reorder). */
export default function WorkListPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const create = useCreateWork();

  const addWork = () => create.mutate(undefined, { onSuccess: (item) => navigate(workEditPath(item._id)) });

  return (
    <div className="flex flex-col gap-5">
      <motion.header
        variants={adminEnter(reduce)}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-5 rounded-card bg-neutral-surface-0 p-5 tablet:flex-row tablet:items-center tablet:justify-between tablet:p-7"
      >
        <div className="flex flex-col gap-2">
          <p className="text-extra-small font-semi-bold tracking-widest text-text-brand uppercase">{COPY.eyebrow}</p>
          <h2 className="text-h4 font-black tracking-tight text-neutral-text-heading">{COPY.title}</h2>
          <p className="text-small text-neutral-text-label">{COPY.subtitle}</p>
        </div>
        <div className="flex flex-col gap-2 tablet:items-end">
          <button
            type="button"
            onClick={addWork}
            disabled={create.isPending}
            aria-busy={create.isPending || undefined}
            className={adminButton({ className: 'self-start tablet:self-auto' })}
          >
            {create.isPending ? <LoaderCircle aria-hidden className="size-4.5 motion-safe:animate-spin" /> : <Plus aria-hidden className="size-4.5" />}
            {create.isPending ? COPY.adding : COPY.add}
          </button>
          {create.isError && (
            <p role="alert" className="text-extra-small text-status-error">
              {COPY.addError}
            </p>
          )}
        </div>
      </motion.header>

      <SectionHeadingCard index={1} />

      <WorkLibrary index={2} onAdd={addWork} adding={create.isPending} />
    </div>
  );
}

function WorkLibrary({ index, onAdd, adding }) {
  const reduce = useReducedMotion();
  const { data: items, isPending, isError, isFetching, refetch } = useWorkList();
  const reorder = useReorderWork();
  const [query, setQuery] = useState('');
  const search = useDeferredValue(query.trim().toLowerCase());

  const list = items ?? [];
  const shown = search ? list.filter((item) => matches(item, search)) : list;
  const titleOf = (item) => item.work.title || COPY.untitled;
  const ids = list.map((item) => item._id);

  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-labelledby="work-library-title"
      className="flex min-w-0 flex-col gap-5 rounded-card bg-neutral-surface-0 p-5 tablet:p-7"
    >
      <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
        <h2 id="work-library-title" className={EYEBROW}>
          {COPY.library}
          {items && <span className="ml-2 text-neutral-text-placeholder normal-case">{COPY.results(list.length)}</span>}
        </h2>
        <div className="relative tablet:w-80">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-neutral-icon-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={COPY.search}
            aria-label={COPY.searchLabel}
            className={cn(FIELD_CONTROL, 'h-11 pl-11')}
          />
        </div>
      </div>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, position) => (
            <Skeleton key={position} className="h-22 rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title={COPY.error.title}
          message={COPY.error.message}
          retryLabel={COPY.error.retry}
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-neutral-surface-raised px-6 py-12 text-center">
          <span aria-hidden className="flex size-12 items-center justify-center rounded-tile bg-neutral-surface-control text-text-brand">
            <FolderPlus className="size-5" />
          </span>
          <p className="text-small font-semi-bold text-neutral-text-heading">{COPY.empty.title}</p>
          <p className="max-w-80 text-extra-small text-neutral-text-label">{COPY.empty.text}</p>
          <button type="button" onClick={onAdd} disabled={adding} className={adminButton({ size: 'sm', className: 'mt-2' })}>
            <Plus aria-hidden className="size-4" />
            {COPY.add}
          </button>
        </div>
      ) : search ? (
        <>
          <p aria-live="polite" className="text-extra-small text-neutral-text-placeholder">
            {shown.length ? `${COPY.results(shown.length)} · ${COPY.searching}` : COPY.noResults}
          </p>
          {shown.length > 0 && (
            <ul className="flex flex-col gap-2">
              {shown.map((item) => (
                <li key={item._id} className="flex rounded-lg bg-neutral-surface-raised p-3">
                  <WorkRow item={item} title={titleOf(item)} />
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <SortableList
            ids={ids}
            onMove={(from, to) => reorder.mutate(arrayMove(list, from, to))}
            labelOf={(id) => titleOf(list.find((item) => item._id === id))}
            labels={COPY}
            className="flex flex-col gap-2"
          >
            {list.map((item) => (
              <SortableRow key={item._id} id={item._id} handleLabel={COPY.move(titleOf(item))}>
                <WorkRow item={item} title={titleOf(item)} />
              </SortableRow>
            ))}
          </SortableList>
          {reorder.isError && (
            <p role="alert" className="text-extra-small text-status-error">
              {COPY.orderError}
            </p>
          )}
        </>
      )}
    </motion.section>
  );
}

/** One item: cover, title + status, summary, tags, year, arrow. The whole row opens the editor. */
function WorkRow({ item, title }) {
  const { work } = item;
  return (
    <Link
      to={workEditPath(item._id)}
      aria-label={COPY.edit(title)}
      className={cn('group flex min-w-0 flex-1 items-center gap-4 rounded-md', FOCUS_RING)}
    >
      <span className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md bg-neutral-surface-control tablet:h-16 tablet:w-24">
        {work.coverImage.url ? (
          <img
            src={cldUrl(work.coverImage.url, { width: 192 })}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
            className="size-full object-cover"
          />
        ) : (
          <ImageOff aria-hidden className="size-4.5 text-neutral-text-placeholder" />
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <span className={cn('truncate text-small font-semi-bold', work.title ? 'text-text-primary' : 'text-neutral-text-placeholder')}>
            {title}
          </span>
          <WorkStatusBadge item={item} />
          {item.isLive && !work.featured && (
            <span className="text-extra-small text-neutral-text-placeholder">{COPY.notOnHome}</span>
          )}
        </span>
        <span className="truncate text-extra-small text-neutral-text-label">{work.description || COPY.noSummary}</span>
        {work.tags.length > 0 && (
          <span className="hidden flex-wrap gap-1.5 tablet:flex">
            {work.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="rounded-full bg-neutral-surface-control px-2 py-0.5 text-extra-small text-neutral-text-muted">
                {tag}
              </span>
            ))}
            {work.tags.length > 4 && (
              <span className="px-1 py-0.5 text-extra-small text-neutral-text-placeholder">+{work.tags.length - 4}</span>
            )}
          </span>
        )}
      </span>

      {work.year && <span className="hidden text-extra-small text-neutral-text-label tabular-nums tablet:block">{work.year}</span>}
      <ArrowRight
        aria-hidden
        className="size-4.5 shrink-0 text-neutral-text-placeholder transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:text-text-brand"
      />
    </Link>
  );
}

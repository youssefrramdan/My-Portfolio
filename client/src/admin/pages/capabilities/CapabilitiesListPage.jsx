import { arrayMove } from '@dnd-kit/sortable';
import { motion, useReducedMotion } from 'framer-motion';
import { FolderPlus, Pencil, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { MAX_PUBLISHED_GROUPS } from '@shared/capabilities';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../../components/buttonStyles';
import LibraryHeader from '../../components/content/LibraryHeader';
import MainDetailsCard from '../../components/content/MainDetailsCard';
import StatusBadge from '../../components/content/StatusBadge';
import ErrorState from '../../components/ErrorState';
import { EYEBROW } from '../../components/SectionCard';
import Skeleton from '../../components/Skeleton';
import SortableList, { SortableRow } from '../../components/SortableList';
import {
  useCapabilityList,
  useCreateCapability,
  useReorderCapabilities,
  useSaveSkillsSection,
  useSkillsSection,
} from '../../hooks/useCapabilities';
import { CAPABILITIES_LIST as COPY, capabilityEditPath, SECTION_FORM } from './constants';

const CHIP_LIMIT = 6;

/** `/admin/content/capabilities` (Figma 538:9668): section heading, then the groups as cards (drag to reorder). */
export default function CapabilitiesListPage() {
  const navigate = useNavigate();
  const create = useCreateCapability();
  const section = useSkillsSection();
  const saveSection = useSaveSkillsSection();
  const addGroup = () => create.mutate(undefined, { onSuccess: (item) => navigate(capabilityEditPath(item._id)) });

  return (
    <div className="flex flex-col gap-5">
      <LibraryHeader copy={COPY} create={create} onAdd={addGroup} variant="raised" />
      <MainDetailsCard index={1} idPrefix="skills-section" copy={SECTION_FORM} query={section} save={saveSection} />
      <GroupLibrary index={2} onAdd={addGroup} adding={create.isPending} />
    </div>
  );
}

function GroupLibrary({ index, onAdd, adding }) {
  const reduce = useReducedMotion();
  const { data: items, isPending, isError, isFetching, refetch } = useCapabilityList();
  const reorder = useReorderCapabilities();
  const list = items ?? [];
  const titleOf = (item) => item.content.title || COPY.untitled;
  const live = list.filter((item) => item.isLive).length;

  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-labelledby="capabilities-library-title"
      className="flex min-w-0 flex-col gap-5 rounded-card bg-neutral-surface-0 p-5 tablet:p-7"
    >
      <div className="flex flex-col gap-2 tablet:flex-row tablet:items-center tablet:justify-between">
        <h2 id="capabilities-library-title" className={EYEBROW}>
          {COPY.library}
          {items && <span className="ml-2 text-neutral-text-placeholder normal-case">{COPY.results(list.length)}</span>}
        </h2>
        {items && (
          <p className="flex items-center gap-2 text-extra-small text-neutral-text-label">
            <span
              className={cn(
                'rounded-full px-2.5 py-1 font-semi-bold tabular-nums',
                live >= MAX_PUBLISHED_GROUPS ? 'bg-status-warning/10 text-status-warning' : 'bg-fill-primary/10 text-text-brand',
              )}
            >
              {COPY.live(live)}
            </span>
            {COPY.liveHint}
          </p>
        )}
      </div>

      {isPending ? (
        <div className="grid gap-3 tablet:grid-cols-2">
          {Array.from({ length: 4 }, (_, position) => (
            <Skeleton key={position} className="h-40 rounded-tile" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title={COPY.error.title} message={COPY.error.message} retryLabel={COPY.error.retry} onRetry={() => refetch()} retrying={isFetching} />
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
      ) : (
        <>
          <SortableList
            ids={list.map((item) => item._id)}
            onMove={(from, to) => reorder.mutate(arrayMove(list, from, to))}
            labelOf={(id) => titleOf(list.find((item) => item._id === id))}
            labels={COPY}
            layout="grid"
            className="grid gap-3 tablet:grid-cols-2"
          >
            {list.map((item, position) => (
              <SortableRow key={item._id} id={item._id} handleLabel={COPY.move(titleOf(item))} className="items-start rounded-tile p-5">
                <GroupCard item={item} title={titleOf(item)} position={position} />
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

/** One group card: number, name + status, chips and item count. The card opens the editor. */
function GroupCard({ item, title, position }) {
  const { items } = item.content;
  return (
    <Link to={capabilityEditPath(item._id)} aria-label={COPY.edit(title)} className={cn('group flex min-w-0 flex-1 flex-col gap-4 rounded-md', FOCUS_RING)}>
      <span className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-md bg-neutral-surface-control text-small font-bold text-text-brand tabular-nums"
        >
          {String(position + 1).padStart(2, '0')}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className={cn('truncate text-small font-semi-bold', item.content.title ? 'text-text-primary' : 'text-neutral-text-placeholder')}>
            {title}
          </span>
          <StatusBadge item={item} className="self-start" />
        </span>
        <Pencil aria-hidden className="size-4 shrink-0 text-neutral-text-placeholder transition-colors group-hover:text-text-brand" />
      </span>
      {items.length > 0 ? (
        <span className="flex flex-wrap gap-1.5">
          {items.slice(0, CHIP_LIMIT).map((label, index) => (
            <span key={`${label}-${index}`} className="rounded-full bg-neutral-surface-control px-2.5 py-1 text-extra-small text-neutral-text-muted">
              {label}
            </span>
          ))}
          {items.length > CHIP_LIMIT && <span className="px-1 py-1 text-extra-small text-neutral-text-placeholder">+{items.length - CHIP_LIMIT}</span>}
        </span>
      ) : (
        <span className="text-extra-small text-neutral-text-placeholder">{COPY.noItems}</span>
      )}
      <span className="text-extra-small text-neutral-text-label">{COPY.items(items.length)}</span>
    </Link>
  );
}

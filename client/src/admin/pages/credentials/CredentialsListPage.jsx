import { arrayMove } from '@dnd-kit/sortable';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, FilePlus, Plus, Search } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CREDENTIAL_KINDS } from '@shared/credentials';
import { FIELD_CONTROL } from '@/components/ui/fieldStyles';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../../components/buttonStyles';
import LetterTile from '../../components/content/LetterTile';
import LibraryHeader from '../../components/content/LibraryHeader';
import MainDetailsCard from '../../components/content/MainDetailsCard';
import StatusBadge from '../../components/content/StatusBadge';
import ErrorState from '../../components/ErrorState';
import { EYEBROW } from '../../components/SectionCard';
import Skeleton from '../../components/Skeleton';
import SortableList, { SortableRow } from '../../components/SortableList';
import {
  useCreateCredential,
  useCredentialList,
  useEducationSection,
  useReorderCredentials,
  useSaveEducationSection,
} from '../../hooks/useCredentials';
import { CREDENTIALS_LIST as COPY, credentialEditPath, KIND_LABELS, SECTION_EXTRAS, SECTION_FORM } from './constants';

const FILTERS = ['all', ...CREDENTIAL_KINDS];

const matches = (item, query) => {
  const { title, issuer, date, detail } = item.content;
  return [title, issuer, date, detail].some((value) => value?.toLowerCase().includes(query));
};

/** `/admin/content/credentials` (Figma 544:10339): section heading, then the credentials (search, kind filter, drag). */
export default function CredentialsListPage() {
  const navigate = useNavigate();
  const create = useCreateCredential();
  const section = useEducationSection();
  const saveSection = useSaveEducationSection();
  const addCredential = () => create.mutate(undefined, { onSuccess: (item) => navigate(credentialEditPath(item._id)) });

  return (
    <div className="flex flex-col gap-5">
      <LibraryHeader copy={COPY} create={create} onAdd={addCredential} />
      <MainDetailsCard
        index={1}
        idPrefix="education-section"
        copy={SECTION_FORM}
        query={section}
        save={saveSection}
        extras={SECTION_EXTRAS}
      />
      <CredentialLibrary index={2} onAdd={addCredential} adding={create.isPending} />
    </div>
  );
}

function CredentialLibrary({ index, onAdd, adding }) {
  const reduce = useReducedMotion();
  const { data: items, isPending, isError, isFetching, refetch } = useCredentialList();
  const reorder = useReorderCredentials();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const search = useDeferredValue(query.trim().toLowerCase());

  const list = items ?? [];
  const filtered = search || kind !== 'all';
  const shown = list.filter((item) => (kind === 'all' || item.content.kind === kind) && (!search || matches(item, search)));
  const titleOf = (item) => item.content.title || COPY.untitled;

  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-labelledby="credentials-library-title"
      className="flex min-w-0 flex-col gap-5 rounded-card bg-neutral-surface-0 p-5 tablet:p-7"
    >
      <div className="flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between">
        <h2 id="credentials-library-title" className={EYEBROW}>
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

      <div role="group" aria-label={COPY.filterLabel} className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-soft">
        {FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={kind === value}
            onClick={() => setKind(value)}
            className={cn(
              'h-9 shrink-0 rounded-full px-4 text-small font-medium transition-colors',
              kind === value
                ? 'bg-fill-primary text-on-brand'
                : 'bg-neutral-surface-raised text-neutral-text-muted hover:bg-neutral-surface-control hover:text-text-primary',
              FOCUS_RING,
            )}
          >
            {value === 'all' ? COPY.all : KIND_LABELS[value]}
          </button>
        ))}
      </div>
      <p className="text-extra-small text-neutral-text-placeholder">{COPY.degreeNote}</p>

      {isPending ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, position) => (
            <Skeleton key={position} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <ErrorState title={COPY.error.title} message={COPY.error.message} retryLabel={COPY.error.retry} onRetry={() => refetch()} retrying={isFetching} />
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg bg-neutral-surface-raised px-6 py-12 text-center">
          <span aria-hidden className="flex size-12 items-center justify-center rounded-tile bg-neutral-surface-control text-text-brand">
            <FilePlus className="size-5" />
          </span>
          <p className="text-small font-semi-bold text-neutral-text-heading">{COPY.empty.title}</p>
          <p className="max-w-80 text-extra-small text-neutral-text-label">{COPY.empty.text}</p>
          <button type="button" onClick={onAdd} disabled={adding} className={adminButton({ size: 'sm', className: 'mt-2' })}>
            <Plus aria-hidden className="size-4" />
            {COPY.add}
          </button>
        </div>
      ) : filtered ? (
        <>
          <p aria-live="polite" className="text-extra-small text-neutral-text-placeholder">
            {shown.length ? `${COPY.results(shown.length)} · ${COPY.filtering}` : COPY.noResults}
          </p>
          {shown.length > 0 && (
            <ul className="flex flex-col gap-2">
              {shown.map((item) => (
                <li key={item._id} className="flex rounded-lg bg-neutral-surface-raised p-3">
                  <CredentialRow item={item} title={titleOf(item)} />
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <>
          <SortableList
            ids={list.map((item) => item._id)}
            onMove={(from, to) => reorder.mutate(arrayMove(list, from, to))}
            labelOf={(id) => titleOf(list.find((item) => item._id === id))}
            labels={COPY}
            className="flex flex-col gap-2"
          >
            {list.map((item) => (
              <SortableRow key={item._id} id={item._id} handleLabel={COPY.move(titleOf(item))}>
                <CredentialRow item={item} title={titleOf(item)} />
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

/** One credential: letter tile, title + status, issuer, kind pill, date. The row opens the editor. */
function CredentialRow({ item, title }) {
  const { content } = item;
  return (
    <Link to={credentialEditPath(item._id)} aria-label={COPY.edit(title)} className={cn('group flex min-w-0 flex-1 items-center gap-4 rounded-md', FOCUS_RING)}>
      <LetterTile text={content.title} />
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <span className={cn('truncate text-small font-semi-bold', content.title ? 'text-text-primary' : 'text-neutral-text-placeholder')}>{title}</span>
          <StatusBadge item={item} />
        </span>
        <span className="truncate text-extra-small text-neutral-text-label">{content.issuer || COPY.noIssuer}</span>
      </span>
      <span className="hidden shrink-0 rounded-full bg-neutral-surface-control px-2.5 py-1 text-extra-small text-neutral-text-muted tablet:inline">
        {KIND_LABELS[content.kind]}
      </span>
      {content.date && <span className="hidden w-24 shrink-0 text-right text-extra-small text-neutral-text-label tabular-nums tablet:block">{content.date}</span>}
      <ArrowRight
        aria-hidden
        className="size-4.5 shrink-0 text-neutral-text-placeholder transition-[color,translate] duration-200 group-hover:translate-x-0.5 group-hover:text-text-brand"
      />
    </Link>
  );
}

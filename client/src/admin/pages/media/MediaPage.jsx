import { motion, useReducedMotion } from 'framer-motion';
import { Check, Copy, ExternalLink, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MEDIA_FOLDER_LIMITS } from '@shared/media';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../../components/buttonStyles';
import ConfirmDialog from '../../components/ConfirmDialog';
import MediaBrowser from '../../components/media/MediaBrowser';
import { useDeleteMedia, useMediaFolders } from '../../hooks/useMedia';
import { useCopy } from '../../lib/useCopy';
import { MEDIA_PAGE as COPY } from './constants';

const KINDS = ['image', 'file'];

/** `/admin/media` (`?kind=file` for PDFs): browse, upload, organize, copy links and delete library files. */
export default function MediaPage() {
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const kind = params.get('kind') === 'file' ? 'file' : 'image';

  return (
    <div className="flex flex-col gap-5">
      <motion.div
        variants={adminEnter(reduce)}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 tablet:flex-row tablet:items-end tablet:justify-between"
      >
        <div className="flex flex-col gap-2">
          <p className="text-extra-small font-semi-bold tracking-widest text-text-brand uppercase">{COPY.eyebrow}</p>
          <h2 className="text-h4 font-black tracking-tight text-neutral-text-heading">{COPY.title}</h2>
          <p className="max-w-160 text-small text-neutral-text-label">{COPY.subtitle}</p>
        </div>
        <div role="group" aria-label={COPY.kindsLabel} className="grid grid-cols-2 gap-1 self-start rounded-xl bg-neutral-surface-0 p-2 tablet:self-auto">
          {KINDS.map((option) => (
            <KindButton
              key={option}
              kind={option}
              active={option === kind}
              onSelect={() => setParams(option === 'image' ? {} : { kind: option }, { replace: true })}
            />
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={adminEnter(reduce)}
        custom={1}
        initial="hidden"
        animate="visible"
        className="flex h-[calc(100dvh-16rem)] min-h-130 flex-col overflow-hidden rounded-card"
      >
        <MediaBrowser
          key={kind}
          kind={kind}
          labels={COPY.browser}
          multiple
          max={MEDIA_FOLDER_LIMITS.moveBatch}
          renderActions={({ selected, clearSelection, setNotice }) =>
            selected.length > 0 && (
              <>
                {selected.length === 1 && <LinkActions item={selected[0]} />}
                <DeleteAction
                  selected={selected}
                  onDeleted={(count) => {
                    clearSelection();
                    setNotice(COPY.delete.done(count));
                  }}
                />
              </>
            )
          }
        />
      </motion.div>
    </div>
  );
}

function KindButton({ kind, active, onSelect }) {
  const { data } = useMediaFolders(kind);
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onSelect}
      className={cn(
        'flex h-11 items-center justify-center gap-2 rounded-md px-5 text-small font-semi-bold whitespace-nowrap transition-colors',
        active ? 'bg-fill-primary text-on-brand' : 'text-neutral-text-label hover:bg-neutral-surface-raised hover:text-text-primary',
        FOCUS_RING,
      )}
    >
      {COPY.kinds[kind]}
      {data && <span className={cn('text-extra-small tabular-nums', active ? 'text-on-brand/70' : 'text-neutral-text-placeholder')}>{data.total}</span>}
    </button>
  );
}

function LinkActions({ item }) {
  const { status, copy } = useCopy(item.url);
  const label = { idle: COPY.copyLink, copied: COPY.copied, failed: COPY.copyFailed }[status];
  return (
    <>
      <a href={item.url} target="_blank" rel="noopener noreferrer" className={adminButton({ variant: 'raised' })}>
        <ExternalLink aria-hidden className="size-4.5" />
        {COPY.open}
      </a>
      <button type="button" onClick={copy} className={adminButton({ variant: 'raised' })}>
        {status === 'copied' ? <Check aria-hidden className="size-4.5 text-text-brand" /> : <Copy aria-hidden className="size-4.5" />}
        <span aria-live="polite">{label}</span>
      </button>
    </>
  );
}

/** Asks first; files still used on the site are listed with where they are used, and nothing is deleted. */
function DeleteAction({ selected, onDeleted }) {
  const [open, setOpen] = useState(false);
  const remove = useDeleteMedia();
  const inUse = remove.error?.status === 409 && Array.isArray(remove.error.data) ? remove.error.data : null;
  const close = () => {
    setOpen(false);
    remove.reset();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={adminButton({ variant: 'raised', className: 'text-status-error' })}
      >
        <Trash2 aria-hidden className="size-4.5" />
        {COPY.delete.action(selected.length)}
      </button>
      <ConfirmDialog
        open={open}
        onClose={close}
        onConfirm={() =>
          remove.mutate(
            selected.map((item) => item._id),
            {
              onSuccess: ({ deleted }) => {
                close();
                onDeleted(deleted);
              },
            },
          )
        }
        tone="danger"
        icon={Trash2}
        title={COPY.delete.title(selected.length)}
        description={COPY.delete.description}
        confirmLabel={COPY.delete.confirm}
        pendingLabel={COPY.delete.pending}
        cancelLabel={COPY.delete.cancel}
        pending={remove.isPending}
        error={remove.isError && !inUse ? (remove.error?.message ?? COPY.delete.error) : null}
      >
        {inUse && (
          <div role="alert" className="flex flex-col gap-3">
            <p className="text-small text-status-error">{COPY.delete.inUse}</p>
            <ul className="flex max-h-48 flex-col gap-2 overflow-y-auto">
              {inUse.map((item) => (
                <li key={item.id} className="flex flex-col gap-0.5 rounded-tile bg-neutral-surface-raised px-4 py-3">
                  <span dir="auto" className="truncate text-small font-semi-bold text-neutral-text-heading">
                    {item.name}
                  </span>
                  <span className="text-extra-small text-neutral-text-label">{COPY.delete.usedIn(item.usedIn)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ConfirmDialog>
    </>
  );
}

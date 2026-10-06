import { motion, useReducedMotion } from 'framer-motion';
import { CircleCheck, EyeOff, RotateCcw } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { contentStatusOf } from '../../lib/contentItems';
import { adminButton } from '../buttonStyles';
import ConfirmDialog from '../ConfirmDialog';
import { EYEBROW } from '../SectionCard';

const DOTS = { published: 'bg-fill-primary', changes: 'bg-status-warning', draft: 'bg-status-warning', pending: 'bg-status-warning' };

/**
 * Figma 538:9420 "Item status": Draft / Pending / Published / unpublished changes, what changed, publish problems,
 * and the Unpublish / Discard actions. `unpublish` / `discard` are the module's mutations; `onDiscarded(content)`
 * resets the form. `text` replaces the status line; `children` adds module notes under it.
 */
export default function ContentStatusCard({ index, item, copy, publish, unpublish, discard, onDiscarded, text, children }) {
  const reduce = useReducedMotion();
  const titleId = useId();
  const [confirm, setConfirm] = useState(null);
  const status = contentStatusOf(item);
  const COPY = copy.status;
  const problems = Array.isArray(publish.error?.data) ? publish.error.data : [];
  const { isSuccess: published, reset: resetPublish } = publish;
  const hasChanges = item.changes.length > 0;

  useEffect(() => {
    if (hasChanges && published) resetPublish();
  }, [hasChanges, published, resetPublish]);

  const close = () => {
    setConfirm(null);
    unpublish.reset();
    discard.reset();
  };
  const runUnpublish = () => unpublish.mutate(undefined, { onSuccess: () => setConfirm(null) });
  const runDiscard = () =>
    discard.mutate(undefined, {
      onSuccess: (next) => {
        publish.reset();
        setConfirm(null);
        onDiscarded(next.content);
      },
    });

  const line =
    text ??
    (status === 'published' ? COPY.publishedText : status === 'changes' ? COPY.changesText(item.changes.length) : COPY.draftText);

  return (
    <motion.section
      variants={adminEnter(reduce)}
      custom={index}
      initial="hidden"
      animate="visible"
      aria-labelledby={titleId}
      className="flex min-w-0 flex-col gap-4 rounded-card bg-neutral-surface-0 p-5"
    >
      <h2 id={titleId} className={EYEBROW}>
        {COPY.eyebrow}
      </h2>
      <div className="flex items-center gap-3 rounded-md bg-neutral-surface-raised px-4 py-3">
        <span aria-hidden className={cn('size-2 shrink-0 rounded-full', DOTS[status])} />
        <span className="text-small font-semi-bold text-neutral-text-heading">{COPY[status]}</span>
      </div>

      {published && !hasChanges ? (
        <p role="status" className="flex items-start gap-2 text-extra-small text-text-brand">
          <CircleCheck aria-hidden className="mt-px size-3.5 shrink-0" />
          {COPY.justPublished}
        </p>
      ) : (
        <p className="text-extra-small text-neutral-text-label">{line}</p>
      )}
      {children}

      {hasChanges && (
        <ul className="flex flex-wrap gap-1.5">
          {item.changes.map((key) => (
            <li key={key} className="rounded-full bg-neutral-surface-raised px-2.5 py-1 text-extra-small text-neutral-text-muted">
              {copy.fields[key] ?? key}
            </li>
          ))}
        </ul>
      )}

      {publish.isError && (
        <div role="alert" className="rounded-md bg-status-error/10 px-4 py-3 text-extra-small text-status-error">
          <p className="font-semi-bold">{problems.length ? publish.error.message : copy.publish.error}</p>
          {problems.length > 0 && (
            <ul className="mt-2 list-disc pl-4">
              {problems.map((problem) => (
                <li key={problem.field}>{problem.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {(item.isLive || (item.wasPublished && item.hasDraft)) && (
        <div className="flex flex-col gap-2">
          {item.wasPublished && item.hasDraft && (
            <button type="button" onClick={() => setConfirm('discard')} className={adminButton({ variant: 'raised', size: 'sm', className: 'w-full' })}>
              <RotateCcw aria-hidden className="size-4" />
              {COPY.discard}
            </button>
          )}
          {item.isLive && (
            <button type="button" onClick={() => setConfirm('unpublish')} className={adminButton({ variant: 'raised', size: 'sm', className: 'w-full' })}>
              <EyeOff aria-hidden className="size-4" />
              {COPY.unpublish}
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirm === 'discard'}
        onClose={close}
        onConfirm={runDiscard}
        title={COPY.discardTitle}
        description={COPY.discardText}
        confirmLabel={COPY.discard}
        pendingLabel={COPY.discarding}
        cancelLabel={COPY.cancel}
        pending={discard.isPending}
        error={discard.isError ? COPY.discardError : null}
        tone="danger"
        icon={RotateCcw}
      />
      <ConfirmDialog
        open={confirm === 'unpublish'}
        onClose={close}
        onConfirm={runUnpublish}
        title={COPY.unpublishTitle}
        description={COPY.unpublishText}
        confirmLabel={COPY.unpublish}
        pendingLabel={COPY.unpublishing}
        cancelLabel={COPY.cancel}
        pending={unpublish.isPending}
        error={unpublish.isError ? COPY.unpublishError : null}
        tone="danger"
        icon={EyeOff}
      />
    </motion.section>
  );
}

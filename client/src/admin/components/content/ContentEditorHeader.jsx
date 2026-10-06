import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, CircleCheck, CloudAlert, LoaderCircle, RotateCw, Send, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../buttonStyles';

const STATE_STYLES = {
  saved: { icon: Check, tile: 'bg-fill-primary/10 text-text-brand' },
  saving: { icon: LoaderCircle, tile: 'bg-neutral-surface-control text-neutral-icon-muted', spin: true },
  invalid: { icon: TriangleAlert, tile: 'bg-status-warning/10 text-status-warning' },
  blocked: { icon: TriangleAlert, tile: 'bg-status-warning/10 text-status-warning' },
  error: { icon: CloudAlert, tile: 'bg-status-error/10 text-status-error' },
};

/** Autosave state of an editor: icon tile + label, and a Retry button after a failed save. */
export function SaveState({ status, copy, onRetry }) {
  const state = STATE_STYLES[status];
  const Icon = state.icon;
  const label = status === 'blocked' ? copy.invalid : copy[status];
  return (
    <div role="status" className="flex items-center gap-2">
      <span aria-hidden className={cn('flex size-6 shrink-0 items-center justify-center rounded-sm', state.tile)}>
        <Icon className={cn('size-3.5', state.spin && 'motion-safe:animate-spin')} />
      </span>
      <span className="text-extra-small text-neutral-text-label">{label}</span>
      {status === 'error' && (
        <button type="button" onClick={onRetry} className={adminButton({ variant: 'secondary', size: 'sm', className: 'h-8 px-3 text-small' })}>
          <RotateCw aria-hidden className="size-3.5" />
          {copy.retry}
        </button>
      )}
    </div>
  );
}

/**
 * Editor header bar (Figma 538:9234): back link, autosave state and the publish button. `publishLabel(item)` can
 * replace the default label (e.g. "Approve & publish" for a pending testimonial).
 */
export default function ContentEditorHeader({ backTo, copy, item, saveStatus, onRetry, publish, onPublish, publishLabel }) {
  const reduce = useReducedMotion();
  const upToDate = item.isLive && item.changes.length === 0;
  const label = publish.isPending
    ? copy.publish.publishing
    : upToDate
      ? copy.publish.upToDate
      : (publishLabel?.(item) ?? (item.isLive ? copy.publish.changes : copy.publish.first));
  const PublishIcon = publish.isPending ? LoaderCircle : upToDate ? CircleCheck : Send;

  return (
    <motion.div
      variants={adminEnter(reduce)}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4 rounded-lg bg-neutral-surface-0 px-5 py-4 tablet:flex-row tablet:items-center tablet:justify-between"
    >
      <Link
        to={backTo}
        className={cn(
          'group inline-flex items-center gap-2 self-start rounded-sm text-base font-semi-bold text-neutral-text-muted transition-colors hover:text-text-primary tablet:self-auto',
          FOCUS_RING,
        )}
      >
        <ArrowLeft aria-hidden className="size-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        {copy.back}
      </Link>

      <div className="flex flex-wrap items-center gap-3 tablet:gap-4">
        <SaveState status={saveStatus} copy={copy.save} onRetry={onRetry} />
        <button
          type="button"
          onClick={onPublish}
          disabled={upToDate || saveStatus !== 'saved' || publish.isPending}
          aria-busy={publish.isPending || undefined}
          title={saveStatus !== 'saved' && !upToDate ? copy.publish.waiting : undefined}
          className={adminButton({ size: 'sm', className: 'ml-auto tablet:ml-0' })}
        >
          <PublishIcon aria-hidden className={cn('size-4.5', publish.isPending && 'motion-safe:animate-spin')} />
          {label}
        </button>
      </div>
    </motion.div>
  );
}

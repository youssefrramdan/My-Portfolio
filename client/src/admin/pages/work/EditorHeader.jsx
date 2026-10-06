import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, Check, CircleCheck, CloudAlert, LoaderCircle, RotateCw, Send, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from '../../components/buttonStyles';
import { WORK_EDITOR as COPY, WORK_PATH } from './constants';

const SAVE_STATES = {
  saved: { icon: Check, tile: 'bg-fill-primary/10 text-text-brand', label: COPY.save.saved },
  saving: { icon: LoaderCircle, tile: 'bg-neutral-surface-control text-neutral-icon-muted', label: COPY.save.saving, spin: true },
  invalid: { icon: TriangleAlert, tile: 'bg-status-warning/10 text-status-warning', label: COPY.save.invalid },
  blocked: { icon: TriangleAlert, tile: 'bg-status-warning/10 text-status-warning', label: COPY.save.invalid },
  error: { icon: CloudAlert, tile: 'bg-status-error/10 text-status-error', label: COPY.save.error },
};

/** Figma 538:9234: back link, autosave state and the publish button. */
export default function EditorHeader({ item, saveStatus, onRetry, publish, onPublish }) {
  const reduce = useReducedMotion();
  const state = SAVE_STATES[saveStatus];
  const Icon = state.icon;
  const upToDate = item.isLive && item.changes.length === 0;
  const label = publish.isPending
    ? COPY.publish.publishing
    : upToDate
      ? COPY.publish.upToDate
      : item.isLive
        ? COPY.publish.changes
        : COPY.publish.first;
  const PublishIcon = publish.isPending ? LoaderCircle : upToDate ? CircleCheck : Send;

  return (
    <motion.div
      variants={adminEnter(reduce)}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4 rounded-lg bg-neutral-surface-0 px-5 py-4 tablet:flex-row tablet:items-center tablet:justify-between"
    >
      <Link
        to={WORK_PATH}
        className={cn(
          'group inline-flex items-center gap-2 self-start rounded-sm text-base font-semi-bold text-neutral-text-muted transition-colors hover:text-text-primary tablet:self-auto',
          FOCUS_RING,
        )}
      >
        <ArrowLeft aria-hidden className="size-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        {COPY.back}
      </Link>

      <div className="flex flex-wrap items-center gap-3 tablet:gap-4">
        <div role="status" className="flex items-center gap-2">
          <span aria-hidden className={cn('flex size-6 shrink-0 items-center justify-center rounded-sm', state.tile)}>
            <Icon className={cn('size-3.5', state.spin && 'motion-safe:animate-spin')} />
          </span>
          <span className="text-extra-small text-neutral-text-label">{state.label}</span>
          {saveStatus === 'error' && (
            <button type="button" onClick={onRetry} className={adminButton({ variant: 'secondary', size: 'sm', className: 'h-8 px-3 text-small' })}>
              <RotateCw aria-hidden className="size-3.5" />
              {COPY.save.retry}
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onPublish}
          disabled={upToDate || saveStatus !== 'saved' || publish.isPending}
          aria-busy={publish.isPending || undefined}
          title={saveStatus !== 'saved' && !upToDate ? COPY.publish.waiting : undefined}
          className={adminButton({ size: 'sm', className: 'ml-auto tablet:ml-0' })}
        >
          <PublishIcon aria-hidden className={cn('size-4.5', publish.isPending && 'motion-safe:animate-spin')} />
          {label}
        </button>
      </div>
    </motion.div>
  );
}

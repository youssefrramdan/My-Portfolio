import { motion, useReducedMotion } from 'framer-motion';
import { Check, CloudAlert, LoaderCircle, RotateCw, TriangleAlert } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import { identityCompletion } from '@shared/identity';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton } from '../../components/buttonStyles';
import { IDENTITY } from './constants';
import { toPayload } from './identityForm';

const STATES = {
  saved: { icon: Check, tile: 'bg-fill-primary/10 text-text-brand', copy: IDENTITY.save.saved },
  saving: { icon: LoaderCircle, tile: 'bg-neutral-surface-control text-neutral-icon-muted', copy: IDENTITY.save.pending, spin: true },
  invalid: { icon: TriangleAlert, tile: 'bg-status-warning/10 text-status-warning', copy: IDENTITY.save.invalid },
  blocked: { icon: TriangleAlert, tile: 'bg-status-warning/10 text-status-warning', copy: IDENTITY.save.blocked },
  error: { icon: CloudAlert, tile: 'bg-status-error/10 text-status-error', copy: IDENTITY.save.error },
};

/** Figma 538:8149: autosave state on the left, "Identity complete" progress on the right. */
export default function SaveBar({ status, onRetry, control }) {
  const reduce = useReducedMotion();
  const values = useWatch({ control });
  const { percent } = identityCompletion(toPayload(values));
  const state = STATES[status];
  const Icon = state.icon;

  return (
    <motion.div
      variants={adminEnter(reduce)}
      custom={1}
      initial="hidden"
      animate="visible"
      className="mt-7 flex flex-col gap-4 rounded-tile bg-neutral-surface-0 px-5 py-4 tablet:flex-row tablet:items-center tablet:justify-between"
    >
      <div role="status" className="flex min-w-0 items-center gap-3">
        <span aria-hidden className={cn('flex size-8 shrink-0 items-center justify-center rounded-md', state.tile)}>
          <Icon className={cn('size-4', state.spin && 'motion-safe:animate-spin')} />
        </span>
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-extra-small font-semi-bold text-neutral-text-heading">{state.copy.title}</span>
          <span className="text-extra-small text-neutral-text-placeholder">{state.copy.text}</span>
        </span>
        {status === 'error' && (
          <button type="button" onClick={onRetry} className={adminButton({ variant: 'secondary', size: 'sm', className: 'ml-2' })}>
            <RotateCw aria-hidden className="size-4" />
            {IDENTITY.save.retry}
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-extra-small text-neutral-text-label">{IDENTITY.save.complete}</span>
        <span
          role="progressbar"
          aria-label={IDENTITY.save.complete}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuetext={IDENTITY.save.completeLabel(percent)}
          className="relative h-1.5 w-24 overflow-hidden rounded-full bg-neutral-surface-control"
        >
          <span
            className="absolute inset-y-0 left-0 rounded-full bg-fill-primary transition-[width] duration-500 motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        </span>
        <span aria-hidden className="w-9 text-right text-extra-small font-semi-bold text-text-brand tabular-nums">
          {percent}%
        </span>
      </div>
    </motion.div>
  );
}

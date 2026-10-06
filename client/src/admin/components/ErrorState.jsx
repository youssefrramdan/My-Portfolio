import { RotateCw, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { adminButton } from './buttonStyles';

/** Card shown when a request fails, with a retry button. */
export default function ErrorState({ title, message, retryLabel, onRetry, retrying = false, className }) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-start gap-4 rounded-card bg-neutral-surface-0 p-7', className)}
    >
      <span className="flex size-11 items-center justify-center rounded-tile bg-status-error/10 text-status-error">
        <TriangleAlert aria-hidden className="size-5" />
      </span>
      <div className="flex flex-col gap-1">
        <h2 className="text-large font-bold text-neutral-text-heading">{title}</h2>
        {message && <p className="text-small text-neutral-text-label">{message}</p>}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          aria-busy={retrying || undefined}
          className={adminButton({ variant: 'secondary', size: 'sm' })}
        >
          <RotateCw aria-hidden className={cn('size-4.5', retrying && 'motion-safe:animate-spin')} />
          {retryLabel}
        </button>
      )}
    </div>
  );
}

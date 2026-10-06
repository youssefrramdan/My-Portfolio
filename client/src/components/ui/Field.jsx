import { cn } from '@/lib/utils';
import { fieldIds } from './fieldStyles';

/** Label above the control, then the inline error (left) and an optional `aside` such as a counter (right). */
export default function Field({ id, label, error, aside, className, children }) {
  const ids = fieldIds(id);
  return (
    <div className={cn('flex flex-col gap-space-1', className)}>
      <label htmlFor={id} className="text-extra-small font-medium text-neutral-text-label">
        {label}
      </label>
      {children}
      {(error || aside) && (
        <div className="flex items-start justify-between gap-3">
          {error && (
            <p id={ids.error} className="text-small text-status-error">
              {error}
            </p>
          )}
          {aside && <span className="ml-auto shrink-0">{aside}</span>}
        </div>
      )}
    </div>
  );
}

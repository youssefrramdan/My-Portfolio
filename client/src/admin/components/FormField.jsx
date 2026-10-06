import { ChevronDown } from 'lucide-react';
import { FIELD_CONTROL, fieldIds } from '@/components/ui/fieldStyles';
import { cn } from '@/lib/utils';

/**
 * Admin form field (Figma FieldLabel + control + hint row): label with a brand `*` when `required` or a muted
 * `optional` note, then the control, then the hint or error on the left and a `count / max` counter on the right.
 * `children(aria)` renders the control with the given `id` / `aria-*` props.
 */
export default function FormField({ id, label, required, optional, hint, error, count, max, className, children }) {
  const ids = fieldIds(id);
  const message = error || hint;
  const describedBy = message ? (error ? ids.error : ids.hint) : undefined;
  const showCount = max !== undefined;

  return (
    <div className={cn('flex min-w-0 flex-col gap-2.5', className)}>
      {label && (
        <label htmlFor={id} className="text-extra-small font-semi-bold text-neutral-text-muted">
          {label}
          {required && (
            <span aria-hidden className="ml-1 text-text-brand">
              *
            </span>
          )}
          {optional && <span className="ml-2 font-regular text-neutral-text-placeholder">{optional}</span>}
        </label>
      )}
      {children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy })}
      {(message || showCount) && (
        <div className="flex items-start justify-between gap-3">
          {message && (
            <p
              id={error ? ids.error : ids.hint}
              className={cn('text-extra-small', error ? 'text-status-error' : 'text-neutral-text-placeholder')}
            >
              {message}
            </p>
          )}
          {showCount && (
            <span
              aria-hidden
              className={cn(
                'ml-auto shrink-0 text-extra-small tabular-nums',
                count > max ? 'text-status-error' : 'text-neutral-text-placeholder',
              )}
            >
              {count}/{max}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/** Text input for admin forms. `size`: `md` (48) | `sm` (44) | `row` (40, raised, inside list rows). */
export function TextInput({ size = 'md', className, ...props }) {
  return <input className={cn(FIELD_CONTROL, CONTROL_SIZES[size], className)} {...props} />;
}

export function TextArea({ className, ...props }) {
  return <textarea className={cn(FIELD_CONTROL, 'min-h-28 resize-y py-space-2', className)} {...props} />;
}

/** Native select with the field look and a chevron. */
export function SelectInput({ size = 'md', className, children, ...props }) {
  return (
    <div className="relative">
      <select className={cn(FIELD_CONTROL, CONTROL_SIZES[size], 'cursor-pointer appearance-none pr-11', className)} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-neutral-icon-muted"
      />
    </div>
  );
}

const CONTROL_SIZES = {
  md: 'h-12',
  sm: 'h-11',
  row: 'h-10 rounded-md bg-neutral-surface-control px-3',
};

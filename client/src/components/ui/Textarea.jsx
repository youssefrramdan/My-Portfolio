import { cn } from '@/lib/utils';
import Field from './Field';
import { FIELD_CONTROL, fieldIds } from './fieldStyles';

/** Labelled textarea with an optional `hint` (e.g. a character counter) under its right edge. */
export default function Textarea({ id, label, error, hint, className, ...props }) {
  const ids = fieldIds(id);
  const describedBy = [error && ids.error, hint && ids.hint].filter(Boolean).join(' ') || undefined;

  return (
    <Field
      id={id}
      label={label}
      error={error}
      aside={
        hint && (
          <span id={ids.hint} className="text-extra-small text-neutral-text-label">
            {hint}
          </span>
        )
      }
    >
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(FIELD_CONTROL, 'h-23 resize-none py-2', className)}
        {...props}
      />
    </Field>
  );
}

import { cn } from '@/lib/utils';
import Field from './Field';
import { FIELD_CONTROL, fieldIds } from './fieldStyles';

/** Labelled text input. `error` shows under it and is linked with `aria-describedby`. */
export default function Input({ id, label, error, className, ...props }) {
  return (
    <Field id={id} label={label} error={error}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? fieldIds(id).error : undefined}
        className={cn(FIELD_CONTROL, 'h-12', className)}
        {...props}
      />
    </Field>
  );
}

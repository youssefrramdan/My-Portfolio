import { useFormContext, useWatch } from 'react-hook-form';
import { cn } from '@/lib/utils';

/**
 * Native color picker bound to a hex form field, with its label and the current hex value. `inputProps` = the
 * `aria` props of a surrounding `FormField` (id, described-by), which then labels the picker.
 */
export default function ColorInput({ name, label, ariaLabel, inputProps, className }) {
  const { register, control } = useFormContext();
  const value = useWatch({ control, name });

  return (
    <label className={cn('flex items-center gap-2.5 rounded-md bg-neutral-surface-input px-3 py-2', className)}>
      <input
        type="color"
        aria-label={ariaLabel}
        {...inputProps}
        className="size-7 shrink-0 cursor-pointer rounded-sm border-0 bg-transparent p-0"
        {...register(name)}
      />
      <span className="flex min-w-0 flex-col">
        <span className="text-extra-small font-semi-bold text-neutral-text-heading">{label}</span>
        <span className="text-extra-small text-neutral-text-placeholder uppercase">{value}</span>
      </span>
    </label>
  );
}

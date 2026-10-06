import { cn } from '@/lib/utils';

/** Classes shared by `Input` and `Textarea` (Figma "Text Input": filled box, no border). */
export const FIELD_CONTROL = cn(
  'w-full rounded-md bg-neutral-surface-input px-space-2 text-base text-text-primary outline-none',
  'placeholder:text-neutral-text-placeholder',
  'focus:ring-1 focus:not-aria-invalid:ring-fill-primary aria-invalid:ring-1 aria-invalid:ring-status-error',
  'disabled:cursor-not-allowed disabled:opacity-60',
);

/** Ids that link a control to its error and hint through `aria-describedby`. */
export const fieldIds = (id) => ({ error: `${id}-error`, hint: `${id}-hint` });

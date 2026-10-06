import { cn } from '@/lib/utils';
import { FOCUS_RING } from './buttonStyles';

/** On / off switch (Figma Toggle 44×24). `label` is its accessible name when there is no visible label. */
export default function Switch({ on, onToggle, label, labelledBy, describedBy, disabled, className }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={labelledBy ? undefined : label}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        on ? 'bg-fill-primary' : 'bg-fill-primary-active',
        FOCUS_RING,
        className,
      )}
    >
      <span
        aria-hidden
        className={cn('absolute top-1 size-4 rounded-full bg-bg-primary transition-[left]', on ? 'left-6' : 'left-1')}
      />
    </button>
  );
}

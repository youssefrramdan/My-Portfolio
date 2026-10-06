import { cn } from '@/lib/utils';

/** Round green percentage badge (Figma setup progress chip, 58px). */
export default function PercentChip({ percent, className }) {
  return (
    <span
      className={cn(
        'flex size-14.5 shrink-0 items-center justify-center rounded-full bg-neutral-surface-input text-small font-bold text-text-brand',
        className,
      )}
    >
      {percent}%
    </span>
  );
}

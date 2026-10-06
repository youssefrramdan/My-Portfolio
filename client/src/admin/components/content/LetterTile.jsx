import { cn } from '@/lib/utils';

/** Square tile with the first letter of `text` (Figma list rows / item rows); `fallback` when `text` is empty. */
export default function LetterTile({ text, fallback = '?', className }) {
  const letter = text?.trim().charAt(0).toUpperCase() || fallback;
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-md bg-neutral-surface-control text-small font-bold text-text-brand',
        className,
      )}
    >
      {letter}
    </span>
  );
}

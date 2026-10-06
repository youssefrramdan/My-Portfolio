import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Setup steps: a green check tile and a crossed-out label when done, a dim tile when not. */
export default function Checklist({ items, doneLabel, todoLabel }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-3 rounded-tile bg-neutral-surface-raised p-3">
          <span
            aria-hidden
            className={cn(
              'flex size-7 shrink-0 items-center justify-center rounded-sm',
              item.done ? 'bg-fill-primary text-on-brand' : 'bg-neutral-surface-control text-neutral-text-placeholder',
            )}
          >
            <Check className="size-4" strokeWidth={2.5} />
          </span>
          <span
            className={cn(
              'text-extra-small',
              item.done ? 'text-neutral-text-label line-through' : 'text-neutral-text-muted',
            )}
          >
            {item.label}
          </span>
          <span className="sr-only">{item.done ? doneLabel : todoLabel}</span>
        </li>
      ))}
    </ul>
  );
}

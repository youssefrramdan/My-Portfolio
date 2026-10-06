import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Pill label above section titles (Figma "Tools Title Container" / Hero badge): flash icon + green text. */
export default function Badge({ className, children }) {
  return (
    <p
      className={cn(
        'inline-flex items-center gap-2 rounded-full bg-neutral-surface-2 px-4 py-1.5 text-small text-text-brand desktop:text-base',
        className,
      )}
    >
      <span className="flex size-6 items-center justify-center rounded-full bg-fill-primary">
        <Zap aria-hidden className="size-3.5 fill-current text-neutral-surface-2" />
      </span>
      {children}
    </p>
  );
}

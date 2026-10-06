import { cn } from '@/lib/utils';

/** Loading placeholder block. Pulses only when motion is allowed. */
export default function Skeleton({ className }) {
  return <div aria-hidden className={cn('rounded-lg bg-neutral-surface-raised motion-safe:animate-pulse', className)} />;
}

import { HugeiconsIcon } from '@hugeicons/react';
import { DynamicIcon } from 'lucide-react/dynamic';
import { cn } from '@/lib/utils';

/**
 * Icon chosen in the dashboard (`shared/icons.js`): a Hugeicons drawing when `nodes` is given, otherwise a lucide
 * icon by kebab-case name (e.g. "pen-tool"), loaded on demand.
 */
export default function Icon({ name, nodes, className, ...props }) {
  if (nodes?.length) {
    return <HugeiconsIcon icon={nodes} aria-hidden className={cn('size-6 shrink-0', className)} {...props} />;
  }
  if (!name) return null;
  return (
    <DynamicIcon
      name={name}
      aria-hidden
      className={cn('size-6 shrink-0', className)}
      fallback={() => <span className={cn('block size-6 shrink-0', className)} />}
      {...props}
    />
  );
}

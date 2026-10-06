import { cn } from '@/lib/utils';
import { statusOf, WORK_STATUS } from './constants';

const TONES = {
  published: 'bg-fill-primary/10 text-text-brand',
  changes: 'bg-status-warning/10 text-status-warning',
  draft: 'bg-neutral-surface-control text-neutral-text-label',
};

/** Published / Unpublished changes / Draft pill for a Work admin item. */
export default function WorkStatusBadge({ item, className }) {
  const status = statusOf(item);
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-extra-small font-semi-bold whitespace-nowrap',
        TONES[status],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {WORK_STATUS[status]}
    </span>
  );
}

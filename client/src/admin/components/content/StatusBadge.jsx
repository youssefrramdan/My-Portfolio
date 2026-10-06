import { cn } from '@/lib/utils';
import { CONTENT_STATUS, contentStatusOf } from '../../lib/contentItems';

const TONES = {
  pending: 'bg-status-warning/10 text-status-warning',
  published: 'bg-fill-primary/10 text-text-brand',
  changes: 'bg-status-warning/10 text-status-warning',
  draft: 'bg-neutral-surface-control text-neutral-text-label',
};

/** Pending review / Published / Unpublished changes / Draft pill for a content item. */
export default function StatusBadge({ item, labels = CONTENT_STATUS, className }) {
  const status = contentStatusOf(item);
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-extra-small font-semi-bold whitespace-nowrap',
        TONES[status],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}

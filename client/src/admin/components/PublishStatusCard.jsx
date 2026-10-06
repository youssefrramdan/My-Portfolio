import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PUBLISH, SHELL } from '../layout/constants';
import { displayHost } from '../lib/format';
import { useCopy } from '../lib/useCopy';
import { FOCUS_RING } from './buttonStyles';
import PublishButton from './PublishButton';
import SectionCard, { EYEBROW } from './SectionCard';

/** Figma "Publish status" card: Live / Draft state with its dot, the publish action and the copyable live URL. */
export default function PublishStatusCard({ site, index, className }) {
  const { status, copy } = useCopy(site.url);
  const CopyIcon = status === 'copied' ? Check : Copy;

  return (
    <SectionCard index={index} className={cn('tablet:p-6', className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-3">
          <h2 className={EYEBROW}>{PUBLISH.status.eyebrow}</h2>
          <p className="flex items-center gap-2 text-base font-bold text-neutral-text-heading">
            <span
              aria-hidden
              className={cn('size-2 shrink-0 rounded-full', site.isPublished ? 'bg-fill-primary' : 'bg-status-warning')}
            />
            {site.isPublished ? PUBLISH.status.live : PUBLISH.status.draft}
          </p>
        </div>
        <PublishButton size="sm" />
      </div>

      <button
        type="button"
        onClick={copy}
        disabled={!site.url}
        aria-label={`${SHELL.copyDomain}: ${displayHost(site.url)}`}
        className={cn(
          'group mt-5 flex items-center justify-between gap-3 rounded-lg bg-neutral-surface-raised px-4 py-3 text-left transition-colors hover:bg-neutral-surface-control',
          FOCUS_RING,
        )}
      >
        <span className="flex min-w-0 flex-col gap-0.5">
          <span className="text-extra-small text-neutral-text-label">{PUBLISH.status.liveUrl}</span>
          <span className="truncate text-small text-text-primary">{displayHost(site.url)}</span>
        </span>
        <CopyIcon
          aria-hidden
          className={cn(
            'size-4 shrink-0 transition-colors',
            status === 'copied' ? 'text-text-brand' : 'text-neutral-text-muted group-hover:text-text-primary',
          )}
        />
        <span role="status" className="sr-only">
          {status === 'copied' ? SHELL.copied : status === 'failed' ? SHELL.copyFailed : ''}
        </span>
      </button>
    </SectionCard>
  );
}

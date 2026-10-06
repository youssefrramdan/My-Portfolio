import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from '../components/buttonStyles';
import { displayHost } from '../lib/format';
import { useCopy } from '../lib/useCopy';
import { SHELL } from './constants';

/** The live site address; clicking copies the full URL and confirms with a check mark (announced politely). */
export default function DomainPill({ url, className }) {
  const { status, copy } = useCopy(url);
  const Icon = status === 'copied' ? Check : Copy;

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!url}
      aria-label={`${SHELL.copyDomain}: ${displayHost(url)}`}
      title={SHELL.copyDomain}
      className={cn(
        'inline-flex h-11 min-w-0 items-center gap-2 rounded-md bg-neutral-surface-0 px-3 text-small text-neutral-text-muted transition-colors hover:text-text-primary',
        FOCUS_RING,
        className,
      )}
    >
      <span className="truncate">{displayHost(url)}</span>
      <Icon aria-hidden className={cn('size-3.5 shrink-0', status === 'copied' && 'text-text-brand')} />
      <span role="status" className="sr-only">
        {status === 'copied' ? SHELL.copied : status === 'failed' ? SHELL.copyFailed : ''}
      </span>
    </button>
  );
}

import { Eye, Menu } from 'lucide-react';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { adminButton } from '../components/buttonStyles';
import PublishButton from '../components/PublishButton';
import { useOverview } from '../hooks/useOverview';
import { formatToday } from '../lib/format';
import { SHELL } from './constants';
import DomainPill from './DomainPill';

/** Sticky page header: title + today's date, the copyable site address (lg+), Preview and Publish. */
export default function Topbar({ title, onOpenMenu, menuOpen }) {
  const { data: overview } = useOverview();
  const siteUrl = overview?.site.url;
  const today = useMemo(() => formatToday(), []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-bg-primary/95 px-4 backdrop-blur-md tablet:h-20.5 tablet:px-6 lg:px-10">
      <button
        type="button"
        onClick={onOpenMenu}
        aria-label={SHELL.openMenu}
        aria-expanded={menuOpen}
        className={adminButton({ variant: 'raised', size: 'icon', className: 'lg:hidden' })}
      >
        <Menu aria-hidden className="size-5" />
      </button>

      <div className="flex min-w-0 flex-1 flex-col">
        <h1 className="truncate text-extra-large font-bold text-neutral-text-heading">{title}</h1>
        <p className="hidden text-extra-small text-neutral-text-label tablet:block">{today}</p>
      </div>

      <div className="flex items-center gap-2.5">
        <DomainPill url={siteUrl} className="hidden lg:inline-flex" />
        <a
          href={siteUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={SHELL.previewLabel}
          className={cn(
            adminButton({ variant: 'raised', size: 'sm' }),
            'max-tablet:size-11 max-tablet:px-0',
            !siteUrl && 'pointer-events-none opacity-60',
          )}
        >
          <Eye aria-hidden className="size-4.5" />
          <span className="max-tablet:sr-only">{SHELL.preview}</span>
        </a>
        <PublishButton size="sm" collapse />
      </div>
    </header>
  );
}

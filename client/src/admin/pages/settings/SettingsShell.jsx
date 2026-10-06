import { motion, useReducedMotion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { adminEnter } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from '../../components/buttonStyles';
import { SaveState } from '../../components/content/ContentEditorHeader';
import ErrorState from '../../components/ErrorState';
import Skeleton from '../../components/Skeleton';
import { SETTINGS_PATHS } from '../../layout/navigation';
import { SETTINGS } from './constants';

/** Main column + sticky aside (Figma: 885 + 340 / 845 + 380). */
export const SETTINGS_GRID = 'grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]';
export const SETTINGS_ASIDE = 'flex min-w-0 flex-col gap-5 xl:sticky xl:top-26 xl:self-start';

const TABS = [
  { key: 'general', to: SETTINGS_PATHS.general },
  { key: 'seo', to: SETTINGS_PATHS.seo },
  { key: 'comingSoon', to: SETTINGS_PATHS.comingSoon },
  { key: 'account', to: SETTINGS_PATHS.account },
];

const STATUS_ORDER = ['error', 'invalid', 'blocked', 'saving', 'saved'];

/** One save state for a page with several autosaving forms: the most urgent one wins. */
export const combineStatus = (...statuses) => STATUS_ORDER.find((status) => statuses.includes(status)) ?? 'saved';

/**
 * Settings page frame (Figma 546:16754): page heading, the "Site settings" bar with the autosave state (or `note`
 * on pages that save with a button) and the tab pills.
 */
export default function SettingsShell({ copy, status, onRetry, note, children }) {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col gap-5">
      <motion.div variants={adminEnter(reduce)} initial="hidden" animate="visible" className="flex flex-col gap-2">
        <p className="text-extra-small font-semi-bold tracking-widest text-text-brand uppercase">{SETTINGS.eyebrow}</p>
        <h2 className="text-h4 font-black tracking-tight text-neutral-text-heading">{copy.title}</h2>
        <p className="text-small text-neutral-text-label">{copy.subtitle}</p>
      </motion.div>

      <motion.div
        variants={adminEnter(reduce)}
        custom={1}
        initial="hidden"
        animate="visible"
        className="mt-2 flex flex-col gap-3 rounded-xl bg-neutral-surface-0 px-5 py-4 tablet:flex-row tablet:items-center tablet:justify-between"
      >
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-extra-small font-semi-bold text-neutral-text-heading">{SETTINGS.bar.title}</p>
          <p className="text-extra-small text-neutral-text-placeholder">{note ?? SETTINGS.bar.text}</p>
        </div>
        {status && <SaveState status={status} copy={SETTINGS.save} onRetry={onRetry} />}
      </motion.div>

      <motion.nav
        variants={adminEnter(reduce)}
        custom={2}
        initial="hidden"
        animate="visible"
        aria-label={SETTINGS.tabsLabel}
        className="grid grid-cols-2 gap-1 rounded-xl bg-neutral-surface-0 p-2 tablet:flex"
      >
        {TABS.map((tab) => (
          <NavLink
            key={tab.key}
            to={tab.to}
            className={({ isActive }) =>
              cn(
                'flex h-12 shrink-0 items-center justify-center rounded-md px-5 text-base font-semi-bold whitespace-nowrap transition-colors',
                isActive ? 'bg-fill-primary text-on-brand' : 'text-neutral-text-label hover:bg-neutral-surface-raised hover:text-text-primary',
                FOCUS_RING,
              )
            }
          >
            {SETTINGS.tabs[tab.key]}
          </NavLink>
        ))}
      </motion.nav>

      {children}
    </div>
  );
}

/**
 * Loading / error states of the autosaving Settings pages; `children(state)` renders the editor. A form only reads
 * its values on mount, so a stale cache (e.g. the contact email changed on the Contact page) waits for the refetch.
 */
export function SettingsLoader({ copy, query, children }) {
  if (query.isPending || (query.isStale && query.isFetching)) {
    return (
      <SettingsShell copy={copy}>
        <div role="status" className={SETTINGS_GRID}>
          <Skeleton className="h-110 rounded-card" />
          <Skeleton className="h-64 rounded-card" />
        </div>
      </SettingsShell>
    );
  }
  if (query.isError) {
    return (
      <SettingsShell copy={copy}>
        <ErrorState
          title={SETTINGS.loadError.title}
          message={SETTINGS.loadError.message}
          retryLabel={SETTINGS.loadError.retry}
          onRetry={() => query.refetch()}
          retrying={query.isFetching}
        />
      </SettingsShell>
    );
  }
  return children(query.data);
}

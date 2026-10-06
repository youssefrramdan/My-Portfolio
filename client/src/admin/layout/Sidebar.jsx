import { useId } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from '../components/buttonStyles';
import { useMe } from '../hooks/useAuth';
import { useOverview } from '../hooks/useOverview';
import { contentTotal, firstName } from '../lib/format';
import { SHELL } from './constants';
import { NAV_ITEMS } from './navigation';
import UserMenu from './UserMenu';

const ITEM = cn('flex h-12 w-full items-center gap-3 rounded-md px-4 text-base transition-colors', FOCUS_RING);
const ITEM_IDLE = 'text-text-secondary hover:bg-neutral-surface-raised hover:text-text-primary';
const ITEM_ACTIVE = 'bg-fill-primary font-semi-bold text-on-brand';

/**
 * Admin sidebar: brand, nav (groups expanded by default, active state from the router) and the user card.
 * `onNavigate` lets the mobile drawer close after a link is followed. `action` sits at the end of the brand row
 * (the drawer's close button), `children` renders above the user card.
 */
export default function Sidebar({ onNavigate, action, children }) {
  const { data: user } = useMe();
  const { data: overview } = useOverview();
  const counts = { content: contentTotal(overview) };
  const name = firstName(user?.name);

  return (
    <div className="scrollbar-soft flex h-full flex-col overflow-y-auto bg-neutral-surface-section px-4 py-5">
      <div className="flex items-center gap-3 px-3 pb-9">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-fill-primary text-base font-black text-on-brand"
        >
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-base font-bold text-neutral-text-heading">{name}</span>
          <span className="text-extra-small text-neutral-text-label">{SHELL.brandSubtitle}</span>
        </span>
        {action}
      </div>

      <p className="px-4 pb-3 text-extra-small font-bold tracking-widest text-neutral-text-placeholder uppercase">
        {SHELL.workspaceLabel}
      </p>

      <nav aria-label={SHELL.navLabel}>
        <ul className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <NavGroup item={item} count={counts[item.countKey]} onNavigate={onNavigate} />
              ) : (
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) => cn(ITEM, isActive ? ITEM_ACTIVE : ITEM_IDLE)}
                >
                  <item.icon aria-hidden className="size-5 shrink-0" />
                  {item.label}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        {children}
        <UserMenu user={user} />
      </div>
    </div>
  );
}

/**
 * A group heading (always expanded, as in Figma) and its sub-items. The heading lights up when a child is active;
 * a group with its own landing page (`to`) has a link heading.
 */
function NavGroup({ item, count, onNavigate }) {
  const { pathname } = useLocation();
  const headingId = useId();
  const hasActiveChild = item.children.some((child) => pathname === child.to || pathname.startsWith(`${child.to}/`));

  const content = (isActive) => (
    <>
      <item.icon aria-hidden className={cn('size-5 shrink-0', !isActive && hasActiveChild && 'text-text-brand')} />
      <span className="flex-1">{item.label}</span>
      {count != null && (
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-extra-small font-semi-bold',
            isActive ? 'bg-on-brand/15 text-on-brand' : 'bg-neutral-surface-control text-neutral-text-label',
          )}
        >
          <span className="sr-only">{SHELL.contentCount(count)}</span>
          <span aria-hidden>{count}</span>
        </span>
      )}
    </>
  );

  return (
    <>
      {item.to ? (
        <NavLink
          id={headingId}
          to={item.to}
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(ITEM, isActive ? ITEM_ACTIVE : hasActiveChild ? 'text-text-primary hover:bg-neutral-surface-raised' : ITEM_IDLE)
          }
        >
          {({ isActive }) => content(isActive)}
        </NavLink>
      ) : (
        <div
          id={headingId}
          className={cn(
            'flex h-12 items-center gap-3 px-4 text-base',
            hasActiveChild ? 'text-text-primary' : 'text-text-secondary',
          )}
        >
          {content(false)}
        </div>
      )}

      <ul aria-labelledby={headingId} className="flex flex-col gap-1">
        {item.children.map((child) => (
          <li key={child.to}>
            <NavLink
              to={child.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex h-10 items-center gap-3 rounded-md pr-4 pl-10 text-small transition-colors',
                  FOCUS_RING,
                  isActive
                    ? 'bg-neutral-surface-input font-semi-bold text-text-brand'
                    : 'text-neutral-text-label hover:bg-neutral-surface-raised hover:text-text-primary',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden
                    className={cn('size-1.5 shrink-0 rounded-full', isActive ? 'bg-fill-primary' : 'bg-neutral-text-placeholder')}
                  />
                  {child.label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </>
  );
}

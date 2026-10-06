import { FileText, Image, LayoutGrid, PanelsTopLeft, Settings, UserRound } from 'lucide-react';

export const ADMIN_BASE = '/admin';
export const LOGIN_PATH = '/admin/login';

export const SETTINGS_PATHS = {
  general: `${ADMIN_BASE}/settings/general`,
  seo: `${ADMIN_BASE}/settings/seo`,
  comingSoon: `${ADMIN_BASE}/settings/coming-soon`,
  account: `${ADMIN_BASE}/settings/account`,
};

/**
 * Sidebar items. Groups (`children`) are expandable; a group with `to` has its own landing page (the heading is a
 * link). `countKey` shows the sum of the Overview counts as a badge.
 * Items without `built` open the placeholder until their module is built (8.3 to 8.10).
 */
export const NAV_ITEMS = [
  { label: 'Overview', to: ADMIN_BASE, icon: LayoutGrid, end: true, built: true },
  { label: 'Identity', to: `${ADMIN_BASE}/identity`, icon: UserRound, built: true },
  {
    label: 'Content',
    to: `${ADMIN_BASE}/content`,
    icon: FileText,
    countKey: 'content',
    children: [
      { label: 'Work', to: `${ADMIN_BASE}/content/work`, built: true },
      { label: 'Capabilities', to: `${ADMIN_BASE}/content/capabilities`, built: true },
      { label: 'Credentials', to: `${ADMIN_BASE}/content/credentials`, built: true },
      { label: 'Testimonials', to: `${ADMIN_BASE}/content/testimonials`, built: true },
      { label: 'Contact', to: `${ADMIN_BASE}/content/contact`, built: true },
    ],
  },
  { label: 'Media', to: `${ADMIN_BASE}/media`, icon: Image, built: true },
  { label: 'Page', to: `${ADMIN_BASE}/page`, icon: PanelsTopLeft, built: true },
  {
    label: 'Settings',
    icon: Settings,
    children: [
      { label: 'General', to: SETTINGS_PATHS.general, built: true },
      { label: 'SEO', to: SETTINGS_PATHS.seo, built: true },
      { label: 'Coming soon', to: SETTINGS_PATHS.comingSoon, built: true },
      { label: 'Account', to: SETTINGS_PATHS.account, built: true },
    ],
  },
];

const flatten = (items, parent) =>
  items.flatMap((item) => (item.children ? flatten(item.children, item) : [{ ...item, parent }]));

/** Every routable item, with its group (`parent`) when it has one. */
export const NAV_ROUTES = flatten(NAV_ITEMS);

/** Placeholder routes, relative to `/admin` (for the router). */
export const PLACEHOLDER_PATHS = NAV_ROUTES.filter((item) => !item.built).map((item) =>
  item.to.slice(ADMIN_BASE.length + 1),
);

const isWithin = (path, to) => path === to || path.startsWith(`${to}/`);

/**
 * Topbar title for a pathname: the item label, prefixed by its group for nested items. Pages below an item
 * (`/admin/content/work/:id`) use that item; a group landing page uses the group label.
 */
export function pageTitle(pathname) {
  const path = pathname.replace(/\/+$/, '') || ADMIN_BASE;
  const match = NAV_ROUTES.filter((item) => !item.end && isWithin(path, item.to)).sort((a, b) => b.to.length - a.to.length)[0]
    ?? NAV_ROUTES.find((item) => item.to === path);
  if (match) return match.parent ? `${match.parent.label} · ${match.label}` : match.label;
  const group = NAV_ITEMS.find((item) => item.children && item.to === path);
  return group?.label ?? NAV_ITEMS[0].label;
}

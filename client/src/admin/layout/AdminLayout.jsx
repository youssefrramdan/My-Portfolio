import { X } from 'lucide-react';
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { MEDIA, useMediaQuery } from '@/lib/useMediaQuery';
import { adminButton } from '../components/buttonStyles';
import { useOverview } from '../hooks/useOverview';
import { SHELL } from './constants';
import DomainPill from './DomainPill';
import Drawer from './Drawer';
import { pageTitle } from './navigation';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

/** Admin shell: fixed sidebar from `lg` (1024), a slide-in drawer below it, sticky topbar, page outlet. */
export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isLarge = useMediaQuery(MEDIA.lg);
  const { pathname } = useLocation();
  const { data: overview } = useOverview();
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-dvh bg-bg-primary text-text-primary">
      <a
        href="#admin-main"
        className="sr-only z-50 rounded-md bg-fill-primary px-4 py-3 font-semi-bold text-on-brand focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        {SHELL.skipToContent}
      </a>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-63.5 lg:block">
        <Sidebar />
      </aside>

      <Drawer open={drawerOpen && !isLarge} onClose={closeDrawer}>
        <Sidebar
          onNavigate={closeDrawer}
          action={
            <button
              type="button"
              onClick={closeDrawer}
              aria-label={SHELL.closeMenu}
              className={adminButton({ variant: 'raised', size: 'icon' })}
            >
              <X aria-hidden className="size-5" />
            </button>
          }
        >
          <DomainPill url={overview?.site.url} className="w-full justify-between" />
        </Sidebar>
      </Drawer>

      <div className="lg:pl-63.5">
        <Topbar title={pageTitle(pathname)} onOpenMenu={() => setDrawerOpen(true)} menuOpen={drawerOpen} />
        <main id="admin-main" tabIndex={-1} className="px-4 pt-4 pb-12 outline-none tablet:px-6 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

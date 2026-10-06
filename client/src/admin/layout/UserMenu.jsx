import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { LogOut, MoreHorizontal } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import { cldUrl } from '@/lib/cloudinary';
import { ADMIN_MOTION, EASE } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from '../components/buttonStyles';
import { useLogout } from '../hooks/useAuth';
import { SHELL } from './constants';
import { LOGIN_PATH } from './navigation';

/**
 * Sidebar user card (photo from Settings > General > Profile, else the initial). Opens a small menu (above it) with
 * Log out. Esc, Tab out or a click outside closes it.
 */
export default function UserMenu({ user }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const itemRef = useRef(null);
  const menuId = useId();
  const reduce = useReducedMotion();
  const logout = useLogout();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return undefined;
    itemRef.current?.focus();
    const closeOnOutside = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [open]);

  const close = (returnFocus) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && open) {
      event.stopPropagation();
      close(true);
    }
  };

  const handleBlur = (event) => {
    if (open && !rootRef.current?.contains(event.relatedTarget)) setOpen(false);
  };

  const handleLogout = () =>
    logout.mutate(undefined, { onSettled: () => navigate(LOGIN_PATH, { replace: true }) });

  return (
    <div ref={rootRef} className="relative" onKeyDown={handleKeyDown} onBlur={handleBlur}>
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label={SHELL.userMenu}
            initial={{ opacity: 0, y: reduce ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : 6 }}
            transition={{ duration: ADMIN_MOTION.menu, ease: EASE }}
            className="absolute inset-x-0 bottom-full mb-2 rounded-lg bg-neutral-surface-control p-1.5 shadow-2xl shadow-bg-primary"
          >
            <button
              ref={itemRef}
              type="button"
              role="menuitem"
              onClick={handleLogout}
              disabled={logout.isPending}
              className={cn(
                'flex h-11 w-full items-center gap-3 rounded-md px-3 text-small text-text-primary transition-colors',
                'hover:bg-neutral-surface-input focus-visible:bg-neutral-surface-input',
                FOCUS_RING,
              )}
            >
              <LogOut aria-hidden className="size-4.5 text-status-error" />
              {logout.isPending ? SHELL.loggingOut : SHELL.logout}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${user?.name ?? ''}, ${SHELL.userMenu}`}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-neutral-surface-raised',
          open && 'bg-neutral-surface-raised',
          FOCUS_RING,
        )}
      >
        {user?.avatar?.url ? (
          <img src={cldUrl(user.avatar.url, { width: 80 })} alt="" className="size-10 shrink-0 rounded-full object-cover" />
        ) : (
          <Avatar name={user?.name} className="size-10 text-small" />
        )}
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-small font-semi-bold text-text-primary">{user?.name}</span>
          <span className="truncate text-extra-small text-neutral-text-label">{user?.title}</span>
        </span>
        <MoreHorizontal aria-hidden className="size-4.5 shrink-0 text-neutral-text-label" />
      </button>
    </div>
  );
}

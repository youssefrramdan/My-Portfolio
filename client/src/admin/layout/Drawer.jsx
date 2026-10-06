import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { ADMIN_MOTION, EASE, MODAL } from '@/lib/motion';
import { useDialog } from '@/lib/useDialog';
import { SHELL } from './constants';

/**
 * Left slide-in panel holding the sidebar below `lg`. Focus is trapped; Esc and the backdrop close it.
 * The caller renders its own close button inside `children`.
 */
export default function Drawer({ open, onClose, children }) {
  const panelRef = useRef(null);
  const { handleKeyDown, restoreFocus } = useDialog({ open, onClose, containerRef: panelRef });

  return createPortal(
    <AnimatePresence onExitComplete={restoreFocus}>
      {open && (
        <DrawerLayer key="drawer" panelRef={panelRef} onClose={onClose} onKeyDown={handleKeyDown}>
          {children}
        </DrawerLayer>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function DrawerLayer({ panelRef, onClose, onKeyDown, children }) {
  const reduce = useReducedMotion();
  const slide = { duration: ADMIN_MOTION.drawer, ease: EASE };
  const fade = { duration: MODAL.fade, ease: EASE };

  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        aria-hidden
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: fade }}
        exit={{ opacity: 0, transition: fade }}
        className="absolute inset-0 bg-overlay-dark-40 backdrop-blur-glass"
      />
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={SHELL.navLabel}
        onKeyDown={onKeyDown}
        initial={reduce ? { opacity: 0 } : { x: '-100%' }}
        animate={reduce ? { opacity: 1, transition: fade } : { x: 0, transition: slide }}
        exit={reduce ? { opacity: 0, transition: fade } : { x: '-100%', transition: slide }}
        className="absolute inset-y-0 left-0 w-63.5 shadow-2xl shadow-bg-primary"
      >
        {children}
      </motion.div>
    </div>
  );
}

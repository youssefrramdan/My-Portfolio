import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { modalVariants } from '@/lib/motion';
import { useDialog } from '@/lib/useDialog';
import { cn } from '@/lib/utils';

/**
 * Accessible dialog in a portal over a blurred backdrop.
 * - Closes with Esc and a backdrop click (`onClose`); the caller adds its own close buttons.
 * - Focus moves to the element marked `data-autofocus` (else the first focusable), stays trapped inside,
 *   and returns to whatever had focus before opening (the trigger) once the exit animation ends.
 * - The page behind does not scroll while open.
 */
export default function Modal({ open, onClose, labelledBy, describedBy, className, children }) {
  const dialogRef = useRef(null);
  const { handleKeyDown, restoreFocus } = useDialog({ open, onClose, containerRef: dialogRef });

  return createPortal(
    <AnimatePresence onExitComplete={restoreFocus}>
      {open && (
        <ModalLayer
          key="modal"
          dialogRef={dialogRef}
          onClose={onClose}
          onKeyDown={handleKeyDown}
          labelledBy={labelledBy}
          describedBy={describedBy}
          className={className}
        >
          {children}
        </ModalLayer>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// Mounted on every open so the reduced-motion preference is read fresh (`useReducedMotion` only reads it on mount).
function ModalLayer({ dialogRef, onClose, onKeyDown, labelledBy, describedBy, className, children }) {
  const variants = modalVariants(useReducedMotion());

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      className="fixed inset-0 z-50 flex items-center justify-center p-grid-margin"
    >
      <motion.div
        aria-hidden
        variants={variants.backdrop}
        onClick={onClose}
        className="absolute inset-0 bg-overlay-dark-40 backdrop-blur-glass"
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        variants={variants.dialog}
        onKeyDown={onKeyDown}
        className={cn('scrollbar-soft relative max-h-full w-full overflow-y-auto', className)}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useId, useRef, useState } from 'react';
import { modalVariants } from '@/lib/motion';
import { cn } from '@/lib/utils';

const FOCUSABLE = 'button:not([disabled]), input, [href], [tabindex]:not([tabindex="-1"])';

/**
 * Small panel anchored under its trigger (menus, pickers). `trigger(props)` renders the button and must spread
 * `props`; `children({ close })` renders the panel. Opens on click, moves focus inside, closes on Esc (focus
 * back to the trigger) or a click outside. `side="top"` opens it above the trigger (footers).
 */
export default function Popover({ trigger, children, align = 'start', side = 'bottom', className }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const panelId = useId();
  const variants = modalVariants(useReducedMotion()).dialog;

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return undefined;
    panelRef.current?.querySelector(FOCUSABLE)?.focus();
    const onPointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      {trigger({
        ref: triggerRef,
        'aria-expanded': open,
        'aria-controls': open ? panelId : undefined,
        'aria-haspopup': 'dialog',
        onClick: () => setOpen((value) => !value),
      })}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            id={panelId}
            role="dialog"
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onKeyDown={(event) => {
              if (event.key !== 'Escape') return;
              event.stopPropagation();
              close();
            }}
            className={cn(
              'absolute z-30 rounded-tile bg-neutral-surface-raised p-2 shadow-2xl ring-1 shadow-bg-primary ring-neutral-surface-control',
              side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
              align === 'end' ? 'right-0' : 'left-0',
              className,
            )}
          >
            {children({ close })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Full-width action inside a popover menu. */
export function PopoverItem({ icon: Icon, onClick, disabled, tone, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-small whitespace-nowrap transition-colors outline-none',
        'hover:bg-neutral-surface-control focus-visible:bg-neutral-surface-control focus-visible:ring-1 focus-visible:ring-fill-primary',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent',
        tone === 'danger' ? 'text-status-error' : 'text-text-primary',
      )}
    >
      {Icon && <Icon aria-hidden className="size-4 shrink-0" />}
      {children}
    </button>
  );
}

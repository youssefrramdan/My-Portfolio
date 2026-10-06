import { useEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'textarea:not([disabled])',
  'select:not([disabled])',
  '[tabindex]',
]
  .map((selector) => `${selector}:not([tabindex="-1"])`)
  .join(',');

const focusablesIn = (element) =>
  [...element.querySelectorAll(FOCUSABLE)].filter((node) => !node.closest('[aria-hidden="true"]'));

/**
 * Shared behaviour of modal layers (Modal, admin Drawer) rendered in a portal:
 * - Focus moves to the element marked `data-autofocus` (else the first focusable) and stays trapped inside.
 * - Esc calls `onClose`.
 * - The page behind does not scroll and is inert while open.
 * Call `restoreFocus` once the exit animation ends to return focus to the trigger.
 */
export function useDialog({ open, onClose, containerRef }) {
  const returnFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    returnFocusRef.current = document.activeElement;
    const container = containerRef.current;
    const target = container?.querySelector('[data-autofocus]') ?? (container && focusablesIn(container)[0]);
    target?.focus({ preventScroll: true });

    // Keeps the scrollbar's space so the page does not shift sideways while it is hidden.
    const root = document.documentElement;
    const previous = { overflow: root.style.overflow, scrollbarGutter: root.style.scrollbarGutter };
    root.style.overflow = 'hidden';
    root.style.scrollbarGutter = 'stable';
    const app = document.getElementById('root');
    if (app) app.inert = true;
    return () => {
      root.style.overflow = previous.overflow;
      root.style.scrollbarGutter = previous.scrollbarGutter;
      if (app) app.inert = false;
    };
  }, [open, containerRef]);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const nodes = focusablesIn(containerRef.current);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const restoreFocus = () => {
    returnFocusRef.current?.focus?.({ preventScroll: true });
    returnFocusRef.current = null;
  };

  return { handleKeyDown, restoreFocus };
}

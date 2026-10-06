import { useEffect } from 'react';

/** Pointer travel (px) after which a press counts as a drag, so the click on a card link is cancelled. */
const DRAG_THRESHOLD = 6;

/**
 * Lets a mouse drag a horizontal scroller (touch and trackpads already scroll natively).
 * The scroller must be positioned (`relative`) so its children's `offsetLeft` are measured from it.
 * Snapping is paused while dragging so the row follows the pointer, then resumes and settles on a card.
 */
export function useDragScroll(ref, enabled = true) {
  useEffect(() => {
    const element = ref.current;
    if (!element || !enabled) return undefined;

    let startX = 0;
    let startScroll = 0;
    let pointerId = null;
    let dragged = false;

    const onPointerDown = (event) => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = element.scrollLeft;
      dragged = false;
    };

    const onPointerMove = (event) => {
      if (event.pointerId !== pointerId) return;
      const distance = event.clientX - startX;
      if (!dragged && Math.abs(distance) < DRAG_THRESHOLD) return;
      if (!dragged) {
        dragged = true;
        element.setPointerCapture(pointerId);
        element.style.scrollSnapType = 'none';
        element.style.cursor = 'grabbing';
      }
      element.scrollLeft = startScroll - distance;
    };

    const restoreSnap = () => {
      element.style.scrollSnapType = '';
    };

    const onPointerUp = (event) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      if (!dragged) return;
      element.style.cursor = '';
      // Re-enabling snap right away would jump; glide to the nearest card first, then restore it.
      const padding = parseFloat(getComputedStyle(element).scrollPaddingLeft) || 0;
      const target = [...element.children]
        .map((child) => child.offsetLeft - padding)
        .reduce((best, left) =>
          Math.abs(left - element.scrollLeft) < Math.abs(best - element.scrollLeft) ? left : best,
        );
      if (Math.abs(target - element.scrollLeft) < 1) return restoreSnap();
      element.addEventListener('scrollend', restoreSnap, { once: true });
      element.scrollTo({ left: target, behavior: 'smooth' });
    };

    const onClickCapture = (event) => {
      if (!dragged) return;
      event.preventDefault();
      event.stopPropagation();
      dragged = false;
    };

    element.addEventListener('pointerdown', onPointerDown);
    element.addEventListener('pointermove', onPointerMove);
    element.addEventListener('pointerup', onPointerUp);
    element.addEventListener('pointercancel', onPointerUp);
    element.addEventListener('click', onClickCapture, true);
    return () => {
      element.removeEventListener('pointerdown', onPointerDown);
      element.removeEventListener('pointermove', onPointerMove);
      element.removeEventListener('pointerup', onPointerUp);
      element.removeEventListener('pointercancel', onPointerUp);
      element.removeEventListener('click', onClickCapture, true);
      element.removeEventListener('scrollend', restoreSnap);
    };
  }, [ref, enabled]);
}

/** Screen reader copy for drag-to-reorder lists (`SortableList` `labels`). */
export const REORDER_LABELS = {
  instructions:
    'To reorder, press Space or Enter on the handle, move with the arrow keys, then press Space or Enter to drop or Escape to cancel.',
  announce: {
    start: (label, position, total) => `Picked up ${label}, position ${position} of ${total}.`,
    over: (label, position, total) => `${label} moved to position ${position} of ${total}.`,
    end: (label, position, total) => `${label} dropped at position ${position} of ${total}.`,
    cancel: (label) => `Reordering ${label} was cancelled.`,
  },
};

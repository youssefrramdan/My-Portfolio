import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, useReducedMotion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import { createContext, useContext, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EASE, SECTION_STACK } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from './buttonStyles';

const verticalOnly = ({ transform }) => ({ ...transform, x: 0 });
const noShift = () => null;

/** Under the pointer while dragging with a pointer; nearest center for the keyboard. */
const pointerFirst = (args) => (args.pointerCoordinates ? pointerWithin(args) : closestCenter(args));

/**
 * `overlay`: the dragged item is drawn in a floating layer (the item itself stays as a placeholder).
 * `live`: the order changes while dragging and the items animate to their new places.
 */
const ListContext = createContext({ overlay: false, live: false });

const INTERACTIVE = 'button, a, input, textarea, select, [contenteditable]';

/**
 * Drag-to-reorder list (pointer or keyboard). `ids` are the item ids in order; `onMove(from, to)` gets array
 * indexes. `labelOf(id)` names an item in the screen reader announcements. `layout`: `vertical` rows | `grid`
 * tiles. Render `SortableRow` / `SortableTile` children with the same ids.
 * `renderOverlay(id)` draws the dragged item in a floating layer that follows the pointer (smoother for image
 * grids); its slot stays behind as a faded placeholder.
 * `live` (grids whose tiles have different sizes): `onMove` runs while dragging, the CSS grid lays the tiles out
 * again and each tile glides to its new place; Esc puts the item back where it started.
 */
export default function SortableList({
  ids,
  onMove,
  labelOf,
  labels,
  layout = 'vertical',
  as: Tag = 'ol',
  className,
  renderOverlay,
  live = false,
  children,
}) {
  const reduce = useReducedMotion();
  const [activeId, setActiveId] = useState(null);
  const startIndex = useRef(-1);
  const lastMove = useRef(0);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const positionOf = (id) => ids.indexOf(id) + 1;
  const total = ids.length;
  const announcements = {
    onDragStart: ({ active }) => labels.announce.start(labelOf(active.id), positionOf(active.id), total),
    onDragOver: ({ active, over }) => (over ? labels.announce.over(labelOf(active.id), positionOf(over.id), total) : undefined),
    onDragEnd: ({ active, over }) => (over ? labels.announce.end(labelOf(active.id), positionOf(over.id), total) : undefined),
    onDragCancel: ({ active }) => labels.announce.cancel(labelOf(active.id)),
  };

  const handleDragStart = ({ active }) => {
    setActiveId(active.id);
    startIndex.current = ids.indexOf(active.id);
  };

  // Live mode: move as soon as the pointer is over another item, but not while the tiles are still gliding
  // (their measured boxes are mid-animation then, which would make two items swap back and forth).
  const handleDragOver = ({ active, over }) => {
    if (!live || !over || active.id === over.id) return;
    const now = performance.now();
    if (now - lastMove.current < SECTION_STACK.reorder) return;
    lastMove.current = now;
    onMove(ids.indexOf(active.id), ids.indexOf(over.id));
  };

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (live || !over || active.id === over.id) return;
    onMove(ids.indexOf(active.id), ids.indexOf(over.id));
  };

  const handleDragCancel = ({ active }) => {
    setActiveId(null);
    const current = ids.indexOf(active.id);
    if (live && startIndex.current >= 0 && current !== startIndex.current) onMove(current, startIndex.current);
  };

  const strategy = live ? noShift : layout === 'vertical' ? verticalListSortingStrategy : rectSortingStrategy;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={live ? pointerFirst : closestCenter}
      measuring={live ? { droppable: { strategy: MeasuringStrategy.Always } } : undefined}
      modifiers={layout === 'vertical' ? [verticalOnly] : []}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      accessibility={{ announcements, screenReaderInstructions: { draggable: labels.instructions } }}
    >
      <SortableContext items={ids} strategy={strategy}>
        <ListContext.Provider value={{ overlay: Boolean(renderOverlay), live }}>
          <Tag className={className}>{children}</Tag>
        </ListContext.Provider>
      </SortableContext>
      {renderOverlay &&
        createPortal(
          <DragOverlay
            dropAnimation={reduce ? null : { duration: SECTION_STACK.reorder, easing: SECTION_STACK.easing }}
          >
            {activeId != null && ids.includes(activeId) ? renderOverlay(activeId) : null}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}

function useSortableItem(id) {
  const reduce = useReducedMotion();
  const { overlay, live } = useContext(ListContext);
  const sortable = useSortable({
    id,
    transition: reduce || live ? null : { duration: SECTION_STACK.reorder, easing: SECTION_STACK.easing },
  });
  return {
    ...sortable,
    reduce,
    overlay,
    live,
    // Live items are moved by Framer Motion layout animations, so dnd-kit must not set a transform.
    style: live ? undefined : { transform: CSS.Translate.toString(sortable.transform), transition: sortable.transition },
  };
}

const LAYOUT_TRANSITION = { layout: { duration: SECTION_STACK.reorder / 1000, ease: EASE } };

function DragHandle({ sortable, label, className }) {
  return (
    <button
      type="button"
      ref={sortable.setActivatorNodeRef}
      {...sortable.attributes}
      {...sortable.listeners}
      aria-label={label}
      className={cn(
        'flex shrink-0 touch-none items-center justify-center rounded-sm text-neutral-text-placeholder transition-colors hover:text-text-primary',
        sortable.isDragging ? 'cursor-grabbing text-text-brand' : 'cursor-grab',
        FOCUS_RING,
        className,
      )}
    >
      <GripVertical aria-hidden className="size-4" />
    </button>
  );
}

const draggingClasses = (sortable) => {
  if (!sortable.isDragging) return false;
  if (sortable.overlay) return 'opacity-35';
  return cn('z-10 shadow-2xl ring-1 shadow-bg-primary ring-fill-primary/40', !sortable.reduce && 'scale-102');
};

/**
 * With a mouse, the whole item can be dragged (not only its handle); presses on its own controls are ignored.
 * Touch keeps the handle only, so swiping over the list still scrolls the page.
 */
function dragAnywhereProps(sortable) {
  const onPointerDown = sortable.listeners?.onPointerDown;
  return {
    onPointerDown: (event) => {
      if (event.pointerType !== 'mouse' || event.target.closest(INTERACTIVE)) return;
      onPointerDown?.(event);
    },
  };
}

/** List row (Figma: #202320, radius 18, padding 12) with the drag handle first. */
export function SortableRow({ id, handleLabel, className, children }) {
  const sortable = useSortableItem(id);
  return (
    <li
      ref={sortable.setNodeRef}
      style={sortable.style}
      className={cn(
        'relative flex items-center gap-3 rounded-lg bg-neutral-surface-raised p-3 transition-[box-shadow,scale]',
        draggingClasses(sortable),
        className,
      )}
    >
      <DragHandle sortable={sortable} label={handleLabel} className="-m-1 p-1" />
      {children}
    </li>
  );
}

/**
 * Grid tile (e.g. an image) with the drag handle in its top-left corner. `dragAnywhere` lets a mouse drag the
 * whole tile.
 */
export function SortableTile({ id, handleLabel, dragAnywhere = false, className, children }) {
  const sortable = useSortableItem(id);
  const Item = sortable.live ? motion.li : 'li';
  const motionProps = sortable.live ? { layout: !sortable.reduce, transition: LAYOUT_TRANSITION } : {};
  return (
    <Item
      ref={sortable.setNodeRef}
      style={sortable.style}
      {...motionProps}
      {...(dragAnywhere ? dragAnywhereProps(sortable) : {})}
      className={cn(
        'relative transition-[box-shadow,scale,opacity]',
        dragAnywhere && 'pointer-fine:cursor-grab',
        draggingClasses(sortable),
        className,
      )}
    >
      {children}
      <DragHandle
        sortable={sortable}
        label={handleLabel}
        className="absolute top-1 left-1 size-6 bg-bg-primary/70 text-neutral-text-muted backdrop-blur-glass"
      />
    </Item>
  );
}

import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Check, FileText, LoaderCircle } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSavePageLayout } from '../hooks/usePageLayout';
import SectionCard from './SectionCard';
import SectionStackRow from './SectionStackRow';

/** Changes are saved together once nothing has changed for this long. */
const SAVE_DELAY_MS = 600;

const verticalOnly = ({ transform }) => ({ ...transform, x: 0 });

/**
 * "Section stack" (Overview and Page): drag rows to reorder, switch sections on / off. Every change shows at once,
 * then the whole stack (order + visibility + navbar labels) is saved in one request after a short pause. A failed
 * save puts the stack back to the last saved state and shows an error. The footer row is fixed (always rendered on
 * the site). `detailed` (Page screen) adds the headings, up / down buttons and navbar labels to the rows.
 */
export default function SectionStack({ sections, labels, index, action, className, detailed = false }) {
  const { items, status, change } = useStackDraft(sections);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const labelOf = (key) => items.find((section) => section.key === key)?.label ?? key;
  const positionOf = (key) => items.findIndex((section) => section.key === key) + 1;
  const announcements = {
    onDragStart: ({ active }) => labels.announce.start(labelOf(active.id), positionOf(active.id), items.length),
    onDragOver: ({ active, over }) =>
      over ? labels.announce.over(labelOf(active.id), positionOf(over.id), items.length) : undefined,
    onDragEnd: ({ active, over }) =>
      over ? labels.announce.end(labelOf(active.id), positionOf(over.id), items.length) : undefined,
    onDragCancel: ({ active }) => labels.announce.cancel(labelOf(active.id)),
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    change(arrayMove(items, positionOf(active.id) - 1, positionOf(over.id) - 1));
  };

  const update = (key, patch) => change(items.map((section) => (section.key === key ? { ...section, ...patch } : section)));
  const toggle = (key) => update(key, { isVisible: !items.find((section) => section.key === key).isVisible });
  const move = (position, delta) => change(arrayMove(items, position, position + delta));

  return (
    <SectionCard
      index={index}
      eyebrow={labels.eyebrow}
      title={labels.title}
      className={className}
      action={
        <div className="flex shrink-0 items-center gap-4">
          <SaveStatus status={status} labels={labels} />
          {action}
        </div>
      }
    >
      {status === 'error' && (
        <p role="alert" className="mt-4 rounded-md bg-status-error/10 px-4 py-3 text-extra-small text-status-error">
          {labels.error}
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[verticalOnly]}
        onDragEnd={handleDragEnd}
        accessibility={{ announcements, screenReaderInstructions: { draggable: labels.instructions } }}
      >
        <SortableContext items={items.map((section) => section.key)} strategy={verticalListSortingStrategy}>
          <ol className="mt-5 flex flex-col gap-2">
            {items.map((section, position) => (
              <SectionStackRow
                key={section.key}
                index={position}
                total={items.length}
                section={section}
                labels={labels}
                onToggle={() => toggle(section.key)}
                detailed={detailed}
                onMove={(delta) => move(position, delta)}
                onRename={(navLabel) => update(section.key, { navLabel })}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      <FooterRow labels={labels.footer} />
    </SectionCard>
  );
}

/**
 * Local copy of the stack. `change(next)` shows `next` immediately and (re)starts the save timer; only the
 * latest state is sent. Server data replaces the copy whenever nothing is waiting to be saved.
 * `status`: idle | saving (waiting or in flight) | saved | error.
 */
function useStackDraft(sections) {
  const { mutateAsync } = useSavePageLayout();
  const [items, setItems] = useState(sections);
  const [status, setStatus] = useState('idle');
  const saved = useRef(sections);
  const latest = useRef(sections);
  const timer = useRef(null);
  const busy = useRef(false);
  const version = useRef(0);

  useEffect(() => {
    if (busy.current) return;
    saved.current = sections;
    latest.current = sections;
    setItems(sections);
  }, [sections]);

  const flush = useCallback(async () => {
    timer.current = null;
    const snapshot = latest.current;
    const current = ++version.current;
    const isLatest = () => current === version.current && !timer.current;
    try {
      await mutateAsync(snapshot);
      saved.current = snapshot;
      if (!isLatest()) return;
      busy.current = false;
      setStatus('saved');
    } catch {
      if (!isLatest()) return;
      busy.current = false;
      latest.current = saved.current;
      setItems(saved.current);
      setStatus('error');
    }
  }, [mutateAsync]);

  useEffect(
    () => () => {
      if (!timer.current) return;
      clearTimeout(timer.current);
      flush();
    },
    [flush],
  );

  const change = (next) => {
    busy.current = true;
    latest.current = next;
    setItems(next);
    setStatus('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, SAVE_DELAY_MS);
  };

  return { items, status, change };
}

function SaveStatus({ status, labels }) {
  return (
    <p role="status" className="flex items-center gap-1.5 text-extra-small text-neutral-text-label">
      {status === 'saving' && (
        <>
          <LoaderCircle aria-hidden className="size-3.5 animate-spin" />
          {labels.saving}
        </>
      )}
      {status === 'saved' && (
        <>
          <Check aria-hidden className="size-3.5 text-text-brand" />
          {labels.saved}
        </>
      )}
    </p>
  );
}

/** Figma 546:16523: the footer is part of every page, so it cannot be moved or hidden. */
function FooterRow({ labels }) {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-lg bg-neutral-surface-section p-4">
      <span
        aria-hidden
        className="flex size-9 shrink-0 items-center justify-center rounded-md bg-neutral-surface-input text-neutral-text-label"
      >
        <FileText className="size-4" />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-extra-small font-semi-bold text-text-secondary">{labels.label}</span>
        <span className="text-extra-small text-neutral-text-placeholder">{labels.source}</span>
      </span>
      <span className="shrink-0 rounded-full bg-neutral-surface-input px-2.5 py-1 text-extra-small text-neutral-text-label uppercase">
        {labels.badge}
      </span>
    </div>
  );
}

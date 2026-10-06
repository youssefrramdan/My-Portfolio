import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useReducedMotion } from 'framer-motion';
import { ChevronDown, ChevronUp, GripVertical, TriangleAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NAV_LABEL_MAX } from '@shared/content';
import { SECTION_STACK } from '@/lib/motion';
import { cn } from '@/lib/utils';
import { adminButton, FOCUS_RING } from './buttonStyles';
import { TextInput } from './FormField';
import Switch from './Switch';

const pad = (number) => String(number).padStart(2, '0');

/**
 * One home page section in a section stack: drag handle (pointer or keyboard), index, label + source, visibility
 * switch. A visible section without content gets the amber warning style. Must be rendered inside a dnd-kit
 * `SortableContext` whose items are the section keys.
 * `detailed` (Page screen, Figma 546:16219): the public heading + type pill, up / down buttons (`onMove(delta)`), the
 * navbar label (`onRename(label)`) and the empty warning on its own line.
 */
export default function SectionStackRow({ index, total, section, labels, onToggle, detailed = false, onMove, onRename }) {
  const reduce = useReducedMotion();
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: section.key,
    transition: reduce ? null : { duration: SECTION_STACK.reorder, easing: SECTION_STACK.easing },
  });
  const isEmpty = section.isVisible && !section.hasContent;
  const name = detailed ? section.title || section.label : section.label;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'relative flex flex-col gap-3 rounded-lg px-4 py-3 transition-[background-color,box-shadow,scale]',
        detailed ? 'p-4' : 'min-h-15.5 justify-center',
        isEmpty ? 'bg-status-warning/6' : 'bg-neutral-surface-raised',
        isDragging && 'z-10 bg-neutral-surface-control shadow-2xl ring-1 shadow-bg-primary ring-fill-primary/40',
        isDragging && !reduce && 'scale-102',
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={labels.reorder(section.label)}
          className={cn(
            '-m-1.5 flex shrink-0 touch-none items-center justify-center rounded-sm p-1.5 text-neutral-text-placeholder transition-colors hover:text-text-primary',
            isDragging ? 'cursor-grabbing text-text-brand' : 'cursor-grab',
            FOCUS_RING,
          )}
        >
          <GripVertical aria-hidden className={detailed ? 'size-4.5' : 'size-4'} />
        </button>
        <span
          aria-hidden
          className={cn(
            'flex shrink-0 items-center justify-center rounded-md bg-neutral-surface-control text-extra-small font-semi-bold text-text-brand',
            detailed ? 'size-9' : 'size-8',
          )}
        >
          {pad(index + 1)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                'truncate font-semi-bold transition-colors',
                detailed ? 'text-small' : 'text-extra-small',
                section.isVisible ? 'text-text-primary' : 'text-neutral-text-label',
              )}
            >
              {name}
            </span>
            {detailed && (
              <span className="shrink-0 rounded-full bg-neutral-surface-control px-2 py-0.5 text-extra-small text-neutral-text-label lowercase">
                {section.type}
              </span>
            )}
          </span>
          {isEmpty && !detailed ? (
            <span className="flex items-center gap-1.5 text-extra-small text-status-warning">
              <TriangleAlert aria-hidden className="size-3.5 shrink-0" />
              <span className="truncate">{labels.empty}</span>
            </span>
          ) : (
            <span className="truncate text-extra-small text-neutral-text-label">
              {detailed ? labels.usesContent(section.source) : section.source}
            </span>
          )}
        </span>
        {detailed && (
          <span className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => onMove(-1)}
              disabled={index === 0}
              aria-label={labels.moveUp(section.label)}
              className={adminButton({ variant: 'secondary', size: 'icon', className: 'size-8' })}
            >
              <ChevronUp aria-hidden className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onMove(1)}
              disabled={index === total - 1}
              aria-label={labels.moveDown(section.label)}
              className={adminButton({ variant: 'secondary', size: 'icon', className: 'size-8' })}
            >
              <ChevronDown aria-hidden className="size-3.5" />
            </button>
          </span>
        )}
        <Switch on={section.isVisible} label={labels.toggle(section.label)} onToggle={onToggle} />
      </div>

      {detailed && (
        <div className="flex flex-col gap-2 tablet:pl-19.5">
          <NavLabelInput section={section} labels={labels} onRename={onRename} />
          {isEmpty && (
            <p className="flex items-center gap-1.5 text-extra-small text-status-warning">
              <TriangleAlert aria-hidden className="size-3.5 shrink-0" />
              {labels.empty}
            </p>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * Navbar label of a section. Typing stays local; the stack takes it on blur or Enter (one save per edit). Empty =
 * the default label (shown as the placeholder).
 */
function NavLabelInput({ section, labels, onRename }) {
  const [value, setValue] = useState(section.navLabel ?? '');
  const id = `nav-label-${section.key}`;

  useEffect(() => setValue(section.navLabel ?? ''), [section.navLabel]);

  const commit = () => {
    const next = value.trim();
    if (next !== value) setValue(next);
    if (next !== (section.navLabel ?? '')) onRename(next);
  };

  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="shrink-0 text-extra-small font-semi-bold text-neutral-text-muted">
        {labels.navLabel}
      </label>
      <TextInput
        id={id}
        size="row"
        value={value}
        maxLength={NAV_LABEL_MAX}
        placeholder={section.defaultNavLabel}
        onChange={(event) => setValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            commit();
          }
        }}
        className="h-9 max-w-56"
      />
      {!section.isVisible && <span className="text-extra-small text-neutral-text-placeholder">{labels.hiddenNav}</span>}
    </div>
  );
}

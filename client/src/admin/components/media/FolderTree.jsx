import { ChevronRight, Folder, FolderOpen, Images, Inbox } from 'lucide-react';
import { useState } from 'react';
import { ALL_MEDIA, folderPath, UNSORTED_MEDIA } from '@shared/media';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from '../buttonStyles';
import { EYEBROW } from '../SectionCard';
import Skeleton from '../Skeleton';
import { childrenOf } from './folders';

const INDENT = ['pl-0', 'pl-4', 'pl-8'];

/**
 * Side navigation of the picker: All media, Unsorted, then the folder tree (expandable, the open folder's
 * ancestors are always expanded). Counts are the items directly inside each place.
 */
export default function FolderTree({ data, isPending, place, onOpen, labels, className }) {
  // Folder id -> expanded, set by the chevrons; without an entry, folders on the open path are expanded.
  const [toggled, setToggled] = useState(() => new Map());
  const folders = data?.folders ?? [];
  const openPath = new Set(folderPath(folders, place).map((folder) => folder._id));
  const isExpanded = (id) => (toggled.has(id) ? toggled.get(id) : openPath.has(id));
  const toggle = (id) => setToggled((current) => new Map(current).set(id, !isExpanded(id)));

  const renderLevel = (parent, depth) => (
    <ul className="flex flex-col gap-0.5">
      {childrenOf(folders, parent).map((folder) => {
        const hasChildren = childrenOf(folders, folder._id).length > 0;
        const isOpen = hasChildren && isExpanded(folder._id);
        const active = place === folder._id;
        return (
          <li key={folder._id}>
            <div className={cn('flex items-center', INDENT[depth] ?? INDENT.at(-1))}>
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggle(folder._id)}
                  aria-expanded={isOpen}
                  aria-label={isOpen ? labels.collapse(folder.name) : labels.expand(folder.name)}
                  className={cn('flex size-6 shrink-0 items-center justify-center rounded-xs text-neutral-icon-muted hover:text-text-primary', FOCUS_RING)}
                >
                  <ChevronRight aria-hidden className={cn('size-3.5 transition-transform duration-200', isOpen && 'rotate-90')} />
                </button>
              ) : (
                <span aria-hidden className="size-6 shrink-0" />
              )}
              <PlaceButton
                icon={active ? FolderOpen : Folder}
                label={folder.name}
                count={folder.count}
                active={active}
                onClick={() => onOpen(folder._id)}
              />
            </div>
            {isOpen && <div className="mt-0.5">{renderLevel(folder._id, depth + 1)}</div>}
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav aria-label={labels.label} className={cn('scrollbar-soft flex flex-col gap-4 overflow-y-auto pr-1', className)}>
      <ul className="flex flex-col gap-0.5">
        <li>
          <PlaceButton icon={Images} label={labels.all} count={data?.total} active={place === ALL_MEDIA} onClick={() => onOpen(ALL_MEDIA)} />
        </li>
        <li>
          <PlaceButton
            icon={Inbox}
            label={labels.unsorted}
            count={data?.unsorted}
            active={place === UNSORTED_MEDIA}
            onClick={() => onOpen(UNSORTED_MEDIA)}
          />
        </li>
      </ul>

      <div className="flex flex-col gap-1.5">
        <p className={cn(EYEBROW, 'px-2')}>{labels.label}</p>
        {isPending ? (
          <div className="flex flex-col gap-1.5">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-9 rounded-md" />
            ))}
          </div>
        ) : (
          renderLevel(null, 0)
        )}
      </div>
    </nav>
  );
}

function PlaceButton({ icon: Icon, label, count, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'flex min-w-0 flex-1 items-center gap-2 rounded-md px-2 py-2 text-left text-small transition-colors',
        active ? 'bg-neutral-surface-raised text-text-primary' : 'text-neutral-text-muted hover:bg-neutral-surface-raised/60 hover:text-text-primary',
        FOCUS_RING,
      )}
    >
      <Icon aria-hidden className={cn('size-4 shrink-0', active ? 'text-text-brand' : 'text-neutral-icon-muted')} />
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count != null && <span className="shrink-0 text-extra-small text-neutral-text-placeholder tabular-nums">{count}</span>}
    </button>
  );
}

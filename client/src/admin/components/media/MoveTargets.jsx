import { Folder, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FOCUS_RING } from '../buttonStyles';
import { flattenFolders } from './folders';

const INDENT = ['pl-3', 'pl-7', 'pl-11'];

/**
 * Destination list for "Move to…": the root (Unsorted for images, Top level for folders) and every folder,
 * indented. `isDisabled(id)` blocks targets (the current folder, a folder's own subtree, too deep).
 */
export default function MoveTargets({ folders, title, rootLabel, isDisabled, onPick, pending }) {
  const options = [{ id: null, name: rootLabel, depth: 0, root: true }, ...flattenFolders(folders).map(({ folder, depth }) => ({ id: folder._id, name: folder.name, depth }))];

  return (
    <div className="flex w-64 flex-col gap-1">
      <p className="px-3 pt-1 pb-1.5 text-extra-small font-semi-bold text-neutral-text-label">{title}</p>
      <ul className="scrollbar-soft flex max-h-64 flex-col gap-0.5 overflow-y-auto">
        {options.map((option) => {
          const Icon = option.root ? Inbox : Folder;
          const disabled = pending || isDisabled(option.id);
          return (
            <li key={option.id ?? 'root'}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(option.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md py-2 pr-3 text-left text-small text-text-primary transition-colors',
                  'hover:bg-neutral-surface-control disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent',
                  INDENT[option.depth] ?? INDENT.at(-1),
                  FOCUS_RING,
                )}
              >
                <Icon aria-hidden className="size-4 shrink-0 text-neutral-icon-muted" />
                <span className="truncate">{option.name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

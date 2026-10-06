import { FolderInput, FolderPen, LoaderCircle, Trash2 } from 'lucide-react';
import { descendantIds, folderPath, MEDIA_FOLDER_LIMITS, subtreeDepth } from '@shared/media';
import { cn } from '@/lib/utils';
import { adminButton } from '../buttonStyles';
import Popover from '../Popover';
import MoveTargets from './MoveTargets';

const actionButton = (className) => adminButton({ variant: 'raised', size: 'sm', className: cn('h-9 px-3', className) });

/**
 * Actions of the open folder: rename (inline field), move with everything inside (not into itself or too deep),
 * delete (its items and subfolders move up to its parent). `onDeleted(parent)` lets the picker step out.
 */
export default function FolderActions({ folder, folders, labels, onRename, onDeleted, update, remove }) {
  const parentName = folder.parent ? folders.find((item) => item._id === folder.parent)?.name : null;
  const inside = new Set(descendantIds(folders, folder._id));
  const height = subtreeDepth(folders, folder._id);
  const tooDeep = (target) => (target ? folderPath(folders, target).length : 0) + height > MEDIA_FOLDER_LIMITS.depth;

  return (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={onRename} className={actionButton()} title={labels.rename}>
        <FolderPen aria-hidden className="size-4" />
        <span className="max-lg:sr-only">{labels.rename}</span>
      </button>

      <Popover
        align="end"
        trigger={(props) => (
          <button type="button" {...props} className={actionButton()} title={labels.move}>
            <FolderInput aria-hidden className="size-4" />
            <span className="max-lg:sr-only">{labels.move}</span>
          </button>
        )}
      >
        {({ close }) => (
          <MoveTargets
            folders={folders}
            title={labels.move}
            rootLabel={labels.topLevel}
            pending={update.isPending}
            isDisabled={(id) =>
              String(id ?? '') === String(folder.parent ?? '') || id === folder._id || inside.has(String(id)) || tooDeep(id)
            }
            onPick={(parent) => update.mutate({ id: folder._id, parent }, { onSuccess: () => close() })}
          />
        )}
      </Popover>

      <Popover
        align="end"
        trigger={(props) => (
          <button type="button" {...props} className={actionButton('hover:text-status-error')} title={labels.delete}>
            <Trash2 aria-hidden className="size-4" />
            <span className="sr-only">{labels.delete}</span>
          </button>
        )}
      >
        {({ close }) => (
          <div className="flex w-72 flex-col gap-3 p-2">
            <p className="text-small font-semi-bold text-neutral-text-heading">{labels.delete}</p>
            <p className="text-extra-small text-neutral-text-label">{labels.deleteText(folder.name, parentName)}</p>
            {remove.isError && (
              <p role="alert" className="text-extra-small text-status-error">
                {remove.error?.message ?? labels.error}
              </p>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => close()} className={adminButton({ variant: 'raised', size: 'sm' })}>
                {labels.cancel}
              </button>
              <button
                type="button"
                disabled={remove.isPending}
                onClick={() => remove.mutate(folder._id, { onSuccess: () => onDeleted(folder.parent ?? null) })}
                className={adminButton({ variant: 'raised', size: 'sm', className: 'text-status-error ring-1 ring-status-error/30' })}
              >
                {remove.isPending && <LoaderCircle aria-hidden className="size-4 motion-safe:animate-spin" />}
                {remove.isPending ? labels.deleting : labels.delete}
              </button>
            </div>
          </div>
        )}
      </Popover>
    </div>
  );
}

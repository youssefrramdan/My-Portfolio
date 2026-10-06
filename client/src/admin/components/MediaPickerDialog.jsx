import { X } from 'lucide-react';
import { useId } from 'react';
import Modal from '@/components/ui/Modal';
import { adminButton } from './buttonStyles';
import MediaBrowser from './media/MediaBrowser';

/**
 * "Choose media" dialog: the media library browser of one `kind` (`image` | `file`) with Cancel / Use selected.
 * `multiple` allows picking up to `max` items; `onSelect(items)` receives the chosen library items in the order they
 * were picked. The dialog keeps one height and only the items area scrolls.
 */
export default function MediaPickerDialog({ open, onClose, kind = 'image', multiple = false, max = 1, onSelect, labels }) {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <Modal
      open={open}
      onClose={onClose}
      labelledBy={titleId}
      describedBy={descriptionId}
      className="flex h-[min(46rem,100%)] max-w-240 flex-col overflow-hidden rounded-card"
    >
      {/* Mounted only while open, so the search, folder and selection start fresh every time. */}
      <MediaBrowser
        kind={kind}
        labels={labels}
        multiple={multiple}
        max={max}
        header={
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h2 id={titleId} className="text-large font-bold text-neutral-text-heading">
                {labels.title[kind]}
              </h2>
              <p id={descriptionId} className="text-extra-small text-neutral-text-label">
                {multiple ? labels.descriptionMany(max) : labels.description}
              </p>
            </div>
            <button type="button" onClick={onClose} aria-label={labels.close} className={adminButton({ variant: 'raised', size: 'icon' })}>
              <X aria-hidden className="size-5" />
            </button>
          </div>
        }
        renderActions={({ selected }) => (
          <>
            <button type="button" onClick={onClose} className={adminButton({ variant: 'raised' })}>
              {labels.cancel}
            </button>
            <button
              type="button"
              disabled={!selected.length}
              onClick={() => {
                onSelect(selected);
                onClose();
              }}
              className={adminButton()}
            >
              {labels.confirm}
            </button>
          </>
        )}
      />
    </Modal>
  );
}

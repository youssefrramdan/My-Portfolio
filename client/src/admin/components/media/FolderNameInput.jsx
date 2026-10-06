import { FolderPen, FolderPlus, X } from 'lucide-react';
import { useState } from 'react';
import { MEDIA_FOLDER_LIMITS as LIMITS } from '@shared/media';
import { adminButton } from '../buttonStyles';

/**
 * Inline folder name field (create or rename). Enter saves, Esc cancels (without closing the dialog around it).
 * Not a `<form>`: the picker is portaled out of the editor form, but React would still bubble its submit there.
 */
export default function FolderNameInput({ mode, initial = '', label, onSubmit, onCancel, pending, error, labels }) {
  const [name, setName] = useState(initial);
  const trimmed = name.trim();
  const Icon = mode === 'rename' ? FolderPen : FolderPlus;
  const submit = () => {
    if (trimmed && !pending) onSubmit(trimmed);
  };

  return (
    <div className="flex flex-col gap-1.5 rounded-tile bg-neutral-surface-raised p-2">
      <div className="flex items-center gap-2">
        <Icon aria-hidden className="ml-2 size-4.5 shrink-0 text-text-brand" />
        <input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submit();
            }
            if (event.key === 'Escape') {
              event.preventDefault();
              event.stopPropagation();
              onCancel();
            }
          }}
          maxLength={LIMITS.name}
          placeholder={labels.namePlaceholder}
          aria-label={label}
          aria-invalid={error ? true : undefined}
          className="h-9 min-w-0 flex-1 rounded-sm bg-neutral-surface-control px-3 text-small text-text-primary outline-none placeholder:text-neutral-text-placeholder focus:ring-1 focus:ring-fill-primary"
        />
        <button type="button" onClick={submit} disabled={!trimmed || pending} className={adminButton({ size: 'sm', className: 'h-9' })}>
          {mode === 'rename' ? labels.save : labels.create}
        </button>
        <button type="button" onClick={onCancel} aria-label={labels.cancel} className={adminButton({ variant: 'raised', size: 'icon', className: 'size-9' })}>
          <X aria-hidden className="size-4" />
        </button>
      </div>
      {error && (
        <p role="alert" className="px-2 text-extra-small text-status-error">
          {error}
        </p>
      )}
    </div>
  );
}

import { Check, ChevronRight, FileText, Folder, FolderInput, FolderPlus, Inbox, LoaderCircle, Search, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ALL_MEDIA, folderPath, MEDIA_FOLDER_LIMITS, UNSORTED_MEDIA } from '@shared/media';
import { FIELD_CONTROL } from '@/components/ui/fieldStyles';
import { cldUrl } from '@/lib/cloudinary';
import { cn } from '@/lib/utils';
import { useCreateFolder, useDeleteFolder, useFilePicker, useMedia, useMediaFolders, useMoveMedia, useUpdateFolder } from '../../hooks/useMedia';
import { formatBytes } from '../../lib/format';
import { adminButton, FOCUS_RING } from '../buttonStyles';
import Popover from '../Popover';
import Skeleton from '../Skeleton';
import FolderActions from './FolderActions';
import FolderNameInput from './FolderNameInput';
import { canNestIn, childrenOf, isFolderPlace, placeName } from './folders';
import FolderTree from './FolderTree';
import MoveTargets from './MoveTargets';

const SEARCH_DELAY_MS = 250;
const NOTICE_MS = 3000;

/**
 * The media library of one `kind` (`image` | `file`) organized in folders (side tree from tablet, folder tiles +
 * breadcrumb everywhere): create / rename / move / delete folders, search the open folder (and its subfolders),
 * upload into it, select items and move them. Used by the "Choose media" dialog and the Media page.
 * `header` goes on top; `renderActions({ selected, clearSelection, setNotice })` adds the footer buttons after
 * "Move to…". `multiple` allows selecting up to `max` items (in the order they were picked). Only the items area
 * scrolls. Mount it with a `key` per kind so the search, folder and selection start fresh.
 */
export default function MediaBrowser({ kind, labels, multiple = false, max = 1, header, renderActions }) {
  const text = labels.folders;
  const [place, setPlace] = useState(ALL_MEDIA);
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState([]);
  const [editor, setEditor] = useState(null);
  const [notice, setNotice] = useState(null);
  const limit = multiple ? max : 1;

  const folderData = useMediaFolders(kind);
  const folders = folderData.data?.folders ?? [];
  const media = useMedia({ kind, search, folder: place });
  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();
  const moveMedia = useMoveMedia();

  const inFolder = isFolderPlace(place);
  const openFolder = inFolder ? folders.find((folder) => folder._id === place) : null;
  const currentName = placeName(folders, place, text);
  const newFolderParent = inFolder ? place : null;
  const canCreate = canNestIn(folders, newFolderParent);

  const picker = useFilePicker({
    kind,
    folder: inFolder ? place : undefined,
    messages: labels.fileErrors,
    multiple: true,
    onUploaded: (items) => setSelected((current) => (multiple ? [...current, ...items].slice(0, limit) : items.slice(-1))),
  });

  useEffect(() => {
    const id = setTimeout(() => setSearch(query.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!notice) return undefined;
    const id = setTimeout(() => setNotice(null), NOTICE_MS);
    return () => clearTimeout(id);
  }, [notice]);

  // A folder that disappeared (deleted elsewhere) falls back to All media.
  useEffect(() => {
    if (inFolder && folderData.isSuccess && !openFolder) setPlace(ALL_MEDIA);
  }, [inFolder, folderData.isSuccess, openFolder]);

  const goTo = (next) => {
    setPlace(next);
    setEditor(null);
    createFolder.reset();
    updateFolder.reset();
  };

  const isSelected = (item) => selected.some((current) => current.publicId === item.publicId);
  const toggle = (item) => {
    if (isSelected(item)) return setSelected(selected.filter((current) => current.publicId !== item.publicId));
    if (!multiple) return setSelected([item]);
    if (selected.length < limit) setSelected([...selected, item]);
  };

  const submitFolderName = (name) => {
    if (editor.mode === 'rename') {
      updateFolder.mutate({ id: editor.folder._id, name }, { onSuccess: () => setEditor(null) });
    } else {
      createFolder.mutate({ name, parent: editor.parent }, { onSuccess: () => setEditor(null) });
    }
  };

  const moveSelected = (folder, close) =>
    moveMedia.mutate(
      { ids: selected.map((item) => item._id), folder },
      {
        onSuccess: () => {
          close();
          setNotice(labels.moved(selected.length, placeName(folders, folder ?? UNSORTED_MEDIA, text)));
        },
      },
    );

  const items = media.data ?? [];
  const subfolders = search || place === UNSORTED_MEDIA ? [] : childrenOf(folders, inFolder ? place : null);
  const showUnsortedTile = place === ALL_MEDIA && !search;
  const editorMutation = editor?.mode === 'rename' ? updateFolder : createFolder;
  const actionError = [updateFolder, deleteFolder, moveMedia].find((mutation) => mutation.isError && mutation !== editorMutation)?.error;
  const { uploading, progress, error } = picker;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 bg-neutral-surface-0 p-5 tablet:p-6">
      {header}

      <div className="flex flex-col gap-2 tablet:flex-row">
        <div className="relative flex-1">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-neutral-icon-muted" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={labels.searchIn(currentName)}
            aria-label={labels.searchIn(currentName)}
            className={cn(FIELD_CONTROL, 'h-11 pl-11')}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setEditor({ mode: 'create', parent: newFolderParent })}
            disabled={!canCreate}
            title={canCreate ? undefined : text.depthLimit(MEDIA_FOLDER_LIMITS.depth)}
            className={adminButton({ variant: 'raised', size: 'sm', className: 'flex-1' })}
          >
            <FolderPlus aria-hidden className="size-4.5" />
            {text.newFolder}
          </button>
          <button
            type="button"
            onClick={picker.open}
            disabled={uploading}
            aria-busy={uploading || undefined}
            className={adminButton({ variant: 'secondary', size: 'sm', className: 'flex-1' })}
          >
            {uploading ? <LoaderCircle aria-hidden className="size-4.5 motion-safe:animate-spin" /> : <Upload aria-hidden className="size-4.5" />}
            {uploading ? labels.uploading(progress ?? 0) : labels.upload}
          </button>
        </div>
        <input {...picker.inputProps} />
      </div>

      {(error || actionError) && (
        <p role="alert" className="rounded-md bg-status-error/10 px-4 py-3 text-extra-small text-status-error">
          {error || actionError?.message || text.error}
        </p>
      )}

      <div className="flex min-h-0 flex-1 gap-5">
        <FolderTree
          data={folderData.data}
          isPending={folderData.isPending}
          place={place}
          onOpen={goTo}
          labels={text}
          className="hidden w-56 shrink-0 tablet:flex"
        />

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex min-h-9 items-center justify-between gap-3">
            <Breadcrumb folders={folders} place={place} onOpen={goTo} labels={text} />
            {openFolder && (
              <FolderActions
                folder={openFolder}
                folders={folders}
                labels={text}
                update={updateFolder}
                remove={deleteFolder}
                onRename={() => setEditor({ mode: 'rename', folder: openFolder })}
                onDeleted={(parent) => goTo(parent ?? ALL_MEDIA)}
              />
            )}
          </div>

          {editor && (
            <FolderNameInput
              key={editor.mode === 'rename' ? editor.folder._id : `new-${editor.parent}`}
              mode={editor.mode}
              initial={editor.mode === 'rename' ? editor.folder.name : ''}
              label={editor.mode === 'rename' ? text.renameLabel(editor.folder.name) : text.nameLabel(placeName(folders, editor.parent ?? ALL_MEDIA, { ...text, all: text.topLevel }))}
              pending={editorMutation.isPending}
              error={editorMutation.isError ? (editorMutation.error?.message ?? text.error) : null}
              onSubmit={submitFolderName}
              onCancel={() => {
                setEditor(null);
                editorMutation.reset();
              }}
              labels={text}
            />
          )}

          <div className="scrollbar-soft -mr-2 min-h-0 flex-1 overflow-y-auto pr-2">
            {(subfolders.length > 0 || showUnsortedTile) && (
              <ul className="mb-4 grid grid-cols-2 gap-2 lg:grid-cols-3">
                {showUnsortedTile && (
                  <li className="tablet:hidden">
                    <FolderTile icon={Inbox} name={text.unsorted} count={folderData.data?.unsorted} onOpen={() => goTo(UNSORTED_MEDIA)} labels={text} />
                  </li>
                )}
                {subfolders.map((folder) => (
                  <li key={folder._id}>
                    <FolderTile icon={Folder} name={folder.name} count={folder.count} onOpen={() => goTo(folder._id)} labels={text} />
                  </li>
                ))}
              </ul>
            )}

            {media.isPending ? (
              <div className="grid grid-cols-2 gap-3 tablet:grid-cols-3 lg:grid-cols-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <Skeleton key={index} className="aspect-4/3 rounded-lg" />
                ))}
              </div>
            ) : media.isError ? (
              <p role="alert" className="py-10 text-center text-small text-status-error">
                {labels.loadError}
              </p>
            ) : items.length === 0 ? (
              <p className="py-10 text-center text-small text-neutral-text-label">
                {search ? labels.noResults : inFolder || place === UNSORTED_MEDIA ? text.emptyFolder : labels.empty[kind]}
              </p>
            ) : (
              <ul className={cn('grid gap-3', kind === 'image' ? 'grid-cols-2 tablet:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1')}>
                {items.map((item) => (
                  <li key={item.publicId}>
                    <MediaItem item={item} kind={kind} selected={isSelected(item)} onToggle={() => toggle(item)} labels={labels} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-border-primary pt-4 tablet:flex-row tablet:items-center tablet:justify-end">
        <p aria-live="polite" className={cn('text-extra-small tablet:mr-auto', notice ? 'text-text-brand' : 'text-neutral-text-label')}>
          {notice ?? (multiple ? labels.selectedCount(selected.length, limit) : null)}
        </p>
        {selected.length > 0 && (
          <Popover
            side="top"
            align="end"
            trigger={(props) => (
              <button type="button" {...props} className={adminButton({ variant: 'raised' })}>
                <FolderInput aria-hidden className="size-4.5" />
                {labels.moveSelected(selected.length)}
              </button>
            )}
          >
            {({ close }) => (
              <MoveTargets
                folders={folders}
                title={labels.moveTitle}
                rootLabel={text.unsorted}
                pending={moveMedia.isPending}
                isDisabled={() => false}
                onPick={(folder) => moveSelected(folder, close)}
              />
            )}
          </Popover>
        )}
        {renderActions?.({ selected, clearSelection: () => setSelected([]), setNotice })}
      </div>
    </div>
  );
}

/** All media › Folder › Subfolder (or All media › Unsorted). The last part is the open place. */
function Breadcrumb({ folders, place, onOpen, labels }) {
  const parts = [
    { id: ALL_MEDIA, name: labels.all },
    ...(place === UNSORTED_MEDIA ? [{ id: UNSORTED_MEDIA, name: labels.unsorted }] : folderPath(folders, place).map((folder) => ({ id: folder._id, name: folder.name }))),
  ];

  return (
    <nav aria-label={labels.path} className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-small">
        {parts.map((part, index) => {
          const last = index === parts.length - 1;
          return (
            <li key={part.id} className={cn('flex min-w-0 items-center gap-1', last ? 'shrink' : 'shrink-0 max-tablet:hidden first:max-tablet:flex')}>
              {index > 0 && <ChevronRight aria-hidden className="size-3.5 shrink-0 text-neutral-icon-muted" />}
              {last ? (
                <span aria-current="page" className="truncate font-semi-bold text-neutral-text-heading">
                  {part.name}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onOpen(part.id)}
                  className={cn('truncate rounded-xs text-neutral-text-label transition-colors hover:text-text-primary', FOCUS_RING)}
                >
                  {part.name}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function FolderTile({ icon: Icon, name, count, onOpen, labels }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={labels.open(name)}
      className={cn(
        'flex w-full items-center gap-3 rounded-tile bg-neutral-surface-raised px-3 py-3 text-left transition-colors hover:bg-neutral-surface-control',
        FOCUS_RING,
      )}
    >
      <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-md bg-neutral-surface-control text-text-brand">
        <Icon className="size-4.5" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-small font-semi-bold text-text-primary">{name}</span>
        {count != null && <span className="text-extra-small text-neutral-text-placeholder">{labels.count(count)}</span>}
      </span>
    </button>
  );
}

function MediaItem({ item, kind, selected, onToggle, labels }) {
  const ring = selected ? 'ring-2 ring-fill-primary' : 'ring-1 ring-transparent hover:ring-neutral-surface-control';

  if (kind === 'file') {
    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={onToggle}
        className={cn('flex w-full items-center gap-3 rounded-lg bg-neutral-surface-raised p-3 text-left transition-shadow', ring, FOCUS_RING)}
      >
        <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-md bg-neutral-surface-control text-text-brand">
          <FileText className="size-4.5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-extra-small font-semi-bold text-text-primary">{item.name}</span>
          <span className="text-extra-small text-neutral-text-placeholder">{formatBytes(item.bytes)}</span>
        </span>
        {selected && <Check aria-hidden className="size-4.5 text-text-brand" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={labels.pick(item.name)}
      onClick={onToggle}
      className={cn('group relative flex w-full flex-col gap-2 rounded-lg p-1 text-left transition-shadow', ring, FOCUS_RING)}
    >
      <span className="relative block aspect-4/3 overflow-hidden rounded-md bg-neutral-surface-control">
        <img src={cldUrl(item.url, { width: 320 })} alt="" loading="lazy" className="size-full object-cover" />
        {selected && (
          <span aria-hidden className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-fill-primary text-on-brand">
            <Check className="size-3.5" />
          </span>
        )}
      </span>
      <span dir="auto" className="truncate px-1 text-extra-small text-neutral-text-label">
        {item.name}
      </span>
    </button>
  );
}

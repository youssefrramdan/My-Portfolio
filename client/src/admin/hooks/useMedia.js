import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useRef, useState } from 'react';
import { MEDIA_LIMITS } from '@shared/identity';
import { ALL_MEDIA } from '@shared/media';
import adminApi from '../lib/adminApi';
import { ADMIN_KEY } from './useAuth';
import { OVERVIEW_KEY } from './useOverview';

const MEDIA_KEY = [...ADMIN_KEY, 'media'];
const FOLDERS_KEY = [...MEDIA_KEY, 'folders'];
const MB = 1024 * 1024;

/**
 * Media library items of one `kind` (`image` | `file`), newest first, filtered by name and `folder`
 * (`all` | `none` = Unsorted | a folder id; searching a folder includes its subfolders).
 */
export function useMedia({ kind, search = '', folder = ALL_MEDIA, enabled = true }) {
  return useQuery({
    queryKey: [...MEDIA_KEY, 'items', kind, folder, search],
    queryFn: () =>
      adminApi
        .get('/admin/media', { params: { kind, folder, search: search || undefined } })
        .then((response) => response.data),
    placeholderData: keepPreviousData,
    enabled,
  });
}

/** `{ folders: [{ _id, name, parent, count }], unsorted, total }`; counts are items of `kind`. */
export function useMediaFolders(kind) {
  return useQuery({
    queryKey: [...FOLDERS_KEY, kind],
    queryFn: () => adminApi.get('/admin/media/folders', { params: { kind } }).then((response) => response.data),
  });
}

function useMediaMutation(mutationFn) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MEDIA_KEY }),
  });
}

export const useCreateFolder = () =>
  useMediaMutation(({ name, parent }) => adminApi.post('/admin/media/folders', { name, parent }).then((response) => response.data));

/** `{ id, name }` renames, `{ id, parent }` moves (parent null = top level). */
export const useUpdateFolder = () =>
  useMediaMutation(({ id, ...changes }) => adminApi.patch(`/admin/media/folders/${id}`, changes).then((response) => response.data));

/** Deletes a folder; its items and subfolders move up to its parent. */
export const useDeleteFolder = () =>
  useMediaMutation((id) => adminApi.delete(`/admin/media/folders/${id}`).then((response) => response.data));

/** Moves library items (`ids`) into `folder` (null = Unsorted). */
export const useMoveMedia = () =>
  useMediaMutation(({ ids, folder }) => adminApi.put('/admin/media/move', { ids, folder }).then((response) => response.data));

/**
 * Deletes library items (`ids`) from the library and Cloudinary. A 409 (`error.data` = `[{ id, name, usedIn }]`)
 * means some are still used on the site and nothing was deleted.
 */
export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => adminApi.delete('/admin/media', { data: { ids } }).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEY });
      queryClient.invalidateQueries({ queryKey: OVERVIEW_KEY });
    },
  });
}

/**
 * Checks a picked file against the library limits before uploading. Returns an error message, or null.
 * The server checks the real file type again.
 */
export function mediaFileError(file, kind, messages) {
  const types = kind === 'image' ? MEDIA_LIMITS.imageTypes : MEDIA_LIMITS.fileTypes;
  const maxBytes = kind === 'image' ? MEDIA_LIMITS.imageBytes : MEDIA_LIMITS.fileBytes;
  if (!types.includes(file.type)) return messages.type;
  if (file.size > maxBytes) return messages.size(maxBytes / MB);
  return null;
}

/**
 * `upload(file, folder?)` stores a file in the media library (inside `folder`, a folder id) and resolves with the
 * new item. `progress` is 0–100 while uploading, else null. The file goes straight from the browser to Cloudinary
 * with a signature from the API (`/admin/media/sign`), then the API checks it and adds it to the library.
 * `messages.failed` is shown when Cloudinary rejects the upload without a reason.
 */
export function useUploadMedia(messages) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(null);

  const mutation = useMutation({
    mutationFn: async ({ file, folder }) => {
      setProgress(0);
      const signed = await adminApi
        .post('/admin/media/sign', { name: file.name, type: file.type, size: file.size, folder })
        .then((response) => response.data);

      const body = new FormData();
      Object.entries(signed.fields).forEach(([key, value]) => body.append(key, value));
      body.append('file', file);
      const uploaded = await axios
        .post(signed.uploadUrl, body, {
          onUploadProgress: ({ loaded, total }) => total && setProgress(Math.round((loaded / total) * 100)),
        })
        .then((response) => response.data)
        .catch((error) => {
          throw new Error(error.response?.data?.error?.message ?? messages?.failed ?? error.message);
        });

      return adminApi
        .post('/admin/media', { publicId: uploaded.public_id, kind: signed.kind, name: file.name, folder })
        .then((response) => response.data);
    },
    onSettled: () => setProgress(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MEDIA_KEY });
      queryClient.invalidateQueries({ queryKey: OVERVIEW_KEY });
    },
  });

  return {
    upload: (file, folder) => mutation.mutateAsync({ file, folder }),
    progress,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/** Most files one "Upload" pick can send at once. */
export const UPLOAD_BATCH = 20;

/**
 * "Upload new" button logic: `open()` shows the file chooser of the hidden input (spread `inputProps` on an
 * `<input>`), the picked file is checked, uploaded (into `folder`, a folder id, when given), and
 * `onUploaded(item)` gets the library item. With `multiple`, up to `max` files (default `UPLOAD_BATCH`) are picked
 * at once and uploaded one after another; `onUploaded(items)` then gets every uploaded item in one call, and files
 * that fail are skipped and named in `error`. `progress` covers the whole batch.
 */
export function useFilePicker({ kind, onUploaded, messages, folder, multiple = false, max = UPLOAD_BATCH }) {
  const inputRef = useRef(null);
  const [errors, setErrors] = useState([]);
  const [batch, setBatch] = useState(null);
  const { upload, progress, reset } = useUploadMedia(messages);

  const onChange = async (event) => {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = '';
    const files = multiple ? picked.slice(0, Math.max(1, max)) : picked.slice(0, 1);
    if (!files.length) return;
    reset();

    const problems = [];
    const uploaded = [];
    const named = (file, message) => (multiple && files.length > 1 ? `${file.name}: ${message}` : message);
    for (const [index, file] of files.entries()) {
      setBatch({ index, total: files.length });
      const message = mediaFileError(file, kind, messages);
      if (message) {
        problems.push(named(file, message));
        continue;
      }
      try {
        uploaded.push(await upload(file, folder));
      } catch (error) {
        problems.push(named(file, error.message));
      }
    }
    setBatch(null);
    setErrors(problems);
    if (!uploaded.length) return;
    onUploaded(multiple ? uploaded : uploaded[0]);
  };

  const overall = batch ? Math.round(((batch.index + (progress ?? 0) / 100) / batch.total) * 100) : null;

  return {
    open: () => inputRef.current?.click(),
    inputProps: {
      ref: inputRef,
      type: 'file',
      accept: kind === 'image' ? MEDIA_LIMITS.imageTypes.join(',') : MEDIA_LIMITS.fileTypes.join(','),
      multiple,
      onChange,
      className: 'sr-only',
      tabIndex: -1,
      'aria-hidden': true,
    },
    progress: overall,
    uploading: batch !== null,
    error: errors.length ? errors.join(' ') : null,
  };
}

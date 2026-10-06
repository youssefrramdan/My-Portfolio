import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { EDUCATION_KEY } from '@/features/education/useEducation';
import adminApi from '../lib/adminApi';
import { ADMIN_KEY } from './useAuth';
import { OVERVIEW_KEY } from './useOverview';

export const CREDENTIALS_KEY = [...ADMIN_KEY, 'credentials'];
const LIST_KEY = [...CREDENTIALS_KEY, 'list'];
const SECTION_KEY = [...CREDENTIALS_KEY, 'section'];
const itemKey = (id) => [...CREDENTIALS_KEY, 'item', id];

const data = (response) => response.data;

/**
 * Admin credential shape: `{ _id, status, isLive, wasPublished, content, changes, hasDraft, order, publishedAt,
 * updatedAt }`. `content` (`{ title, kind, issuer, date, link, detail, subjects }`) is the working copy.
 */
export function useCredentialList() {
  return useQuery({ queryKey: LIST_KEY, queryFn: () => adminApi.get('/admin/credentials').then(data) });
}

export function useCredential(id) {
  return useQuery({
    queryKey: itemKey(id),
    queryFn: () => adminApi.get(`/admin/credentials/${id}`).then(data),
    refetchOnWindowFocus: false,
    retry: (count, error) => error?.status !== 404 && error?.status !== 400 && count < 2,
  });
}

/** Refreshes what the public site, the list and the overview show after a credential changes. */
function useRefreshCredentials() {
  const queryClient = useQueryClient();
  return ({ site = false } = {}) => {
    queryClient.invalidateQueries({ queryKey: LIST_KEY });
    queryClient.invalidateQueries({ queryKey: OVERVIEW_KEY });
    if (site) queryClient.invalidateQueries({ queryKey: EDUCATION_KEY });
  };
}

/** New empty draft credential at the end of the list; resolves with the admin item. */
export function useCreateCredential() {
  const queryClient = useQueryClient();
  const refresh = useRefreshCredentials();
  return useMutation({
    mutationFn: () => adminApi.post('/admin/credentials').then(data),
    onSuccess: (item) => {
      queryClient.setQueryData(itemKey(item._id), item);
      refresh();
    },
  });
}

/** `mutateAsync(content)` saves the whole draft; only the publish bookkeeping is copied into the cache. */
export function useSaveCredentialDraft(id) {
  const queryClient = useQueryClient();
  const refresh = useRefreshCredentials();
  return useMutation({
    mutationFn: (content) => adminApi.put(`/admin/credentials/${id}`, content).then(data),
    onSuccess: ({ changes, hasDraft, updatedAt }) => {
      queryClient.setQueryData(itemKey(id), (item) => (item ? { ...item, changes, hasDraft, updatedAt } : item));
      refresh();
    },
  });
}

/** Publish / unpublish / discard replace the cached item and refresh the site. */
function useCredentialAction(id, path) {
  const queryClient = useQueryClient();
  const refresh = useRefreshCredentials();
  return useMutation({
    mutationFn: () => adminApi.post(`/admin/credentials/${id}/${path}`).then(data),
    onSuccess: (item) => {
      queryClient.setQueryData(itemKey(id), item);
      refresh({ site: true });
    },
  });
}

export const usePublishCredential = (id) => useCredentialAction(id, 'publish');
export const useUnpublishCredential = (id) => useCredentialAction(id, 'unpublish');
export const useDiscardCredential = (id) => useCredentialAction(id, 'discard');

export function useDeleteCredential(id) {
  const queryClient = useQueryClient();
  const refresh = useRefreshCredentials();
  return useMutation({
    mutationFn: () => adminApi.delete(`/admin/credentials/${id}`).then(data),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: itemKey(id) });
      refresh({ site: true });
    },
  });
}

/** `mutate(items)` saves a new display order. The list moves at once; on failure it goes back and `error` is set. */
export function useReorderCredentials() {
  const queryClient = useQueryClient();
  const refresh = useRefreshCredentials();
  return useMutation({
    mutationFn: (items) => adminApi.put('/admin/credentials/order', { ids: items.map((item) => item._id) }).then(data),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: LIST_KEY });
      const previous = queryClient.getQueryData(LIST_KEY);
      queryClient.setQueryData(LIST_KEY, items);
      return { previous };
    },
    onError: (_error, _items, context) => queryClient.setQueryData(LIST_KEY, context?.previous),
    onSuccess: (items) => {
      queryClient.setQueryData(LIST_KEY, items);
      refresh({ site: true });
    },
  });
}

/** The "Education & Learning" heading (saved straight to the site). */
export function useEducationSection() {
  return useQuery({ queryKey: SECTION_KEY, queryFn: () => adminApi.get('/admin/credentials/section').then(data) });
}

export function useSaveEducationSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (section) => adminApi.put('/admin/credentials/section', section).then(data),
    onSuccess: (section) => {
      queryClient.setQueryData(SECTION_KEY, section);
      queryClient.invalidateQueries({ queryKey: EDUCATION_KEY });
    },
  });
}

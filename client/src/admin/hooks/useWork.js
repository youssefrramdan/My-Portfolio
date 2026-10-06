import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PROJECTS_KEY } from '@/features/projects/useProjects';
import adminApi from '../lib/adminApi';
import { ADMIN_KEY } from './useAuth';
import { OVERVIEW_KEY } from './useOverview';

export const WORK_KEY = [...ADMIN_KEY, 'work'];
const WORK_LIST_KEY = [...WORK_KEY, 'list'];
const WORK_SECTION_KEY = [...WORK_KEY, 'section'];
const workItemKey = (id) => [...WORK_KEY, 'item', id];

const data = (response) => response.data;

/**
 * Admin item shape: `{ _id, slug, status, isLive, wasPublished, work, changes, hasDraft, order, publishedAt,
 * updatedAt }`. `work` is the working copy (draft, else live).
 */
export function useWorkList() {
  return useQuery({ queryKey: WORK_LIST_KEY, queryFn: () => adminApi.get('/admin/projects').then(data) });
}

export function useWorkItem(id) {
  return useQuery({
    queryKey: workItemKey(id),
    queryFn: () => adminApi.get(`/admin/projects/${id}`).then(data),
    refetchOnWindowFocus: false,
    retry: (count, error) => error?.status !== 404 && error?.status !== 400 && count < 2,
  });
}

/** Refreshes what the public site, the Work list and the overview show after an item changes. */
function useRefreshWork() {
  const queryClient = useQueryClient();
  return ({ site = false } = {}) => {
    queryClient.invalidateQueries({ queryKey: WORK_LIST_KEY });
    queryClient.invalidateQueries({ queryKey: OVERVIEW_KEY });
    if (site) queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
  };
}

/** New empty draft at the end of the list; resolves with the admin item. */
export function useCreateWork() {
  const queryClient = useQueryClient();
  const refresh = useRefreshWork();
  return useMutation({
    mutationFn: () => adminApi.post('/admin/projects').then(data),
    onSuccess: (item) => {
      queryClient.setQueryData(workItemKey(item._id), item);
      refresh();
    },
  });
}

/**
 * `mutateAsync(work)` saves the whole draft. Only the publish bookkeeping is copied into the cache: the form keeps
 * what the user is typing.
 */
export function useSaveWorkDraft(id) {
  const queryClient = useQueryClient();
  const refresh = useRefreshWork();
  return useMutation({
    mutationFn: (work) => adminApi.put(`/admin/projects/${id}`, work).then(data),
    onSuccess: ({ changes, hasDraft, updatedAt }) => {
      queryClient.setQueryData(workItemKey(id), (item) => (item ? { ...item, changes, hasDraft, updatedAt } : item));
      refresh();
    },
  });
}

/** Publish / unpublish / discard replace the cached item and refresh the site. */
function useWorkAction(id, path) {
  const queryClient = useQueryClient();
  const refresh = useRefreshWork();
  return useMutation({
    mutationFn: () => adminApi.post(`/admin/projects/${id}/${path}`).then(data),
    onSuccess: (item) => {
      queryClient.setQueryData(workItemKey(id), item);
      refresh({ site: true });
    },
  });
}

export const usePublishWork = (id) => useWorkAction(id, 'publish');
export const useUnpublishWork = (id) => useWorkAction(id, 'unpublish');
export const useDiscardWork = (id) => useWorkAction(id, 'discard');

export function useDeleteWork(id) {
  const queryClient = useQueryClient();
  const refresh = useRefreshWork();
  return useMutation({
    mutationFn: () => adminApi.delete(`/admin/projects/${id}`).then(data),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: workItemKey(id) });
      refresh({ site: true });
    },
  });
}

/**
 * `mutate(items)` saves a new display order. The list moves at once; on failure it goes back and `error` is set.
 */
export function useReorderWork() {
  const queryClient = useQueryClient();
  const refresh = useRefreshWork();
  return useMutation({
    mutationFn: (items) => adminApi.put('/admin/projects/order', { ids: items.map((item) => item._id) }).then(data),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: WORK_LIST_KEY });
      const previous = queryClient.getQueryData(WORK_LIST_KEY);
      queryClient.setQueryData(WORK_LIST_KEY, items);
      return { previous };
    },
    onError: (_error, _items, context) => queryClient.setQueryData(WORK_LIST_KEY, context?.previous),
    onSuccess: (items) => {
      queryClient.setQueryData(WORK_LIST_KEY, items);
      refresh({ site: true });
    },
  });
}

/** The "Selected Projects" heading (saved straight to the site). */
export function useProjectsSection() {
  return useQuery({ queryKey: WORK_SECTION_KEY, queryFn: () => adminApi.get('/admin/projects/section').then(data) });
}

export function useSaveProjectsSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (section) => adminApi.put('/admin/projects/section', section).then(data),
    onSuccess: (section) => {
      queryClient.setQueryData(WORK_SECTION_KEY, section);
      queryClient.invalidateQueries({ queryKey: PROJECTS_KEY });
    },
  });
}

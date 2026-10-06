import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SKILLS_KEY } from '@/features/skills/useSkills';
import adminApi from '../lib/adminApi';
import { ADMIN_KEY } from './useAuth';
import { OVERVIEW_KEY } from './useOverview';

export const CAPABILITIES_KEY = [...ADMIN_KEY, 'capabilities'];
const LIST_KEY = [...CAPABILITIES_KEY, 'list'];
const SECTION_KEY = [...CAPABILITIES_KEY, 'section'];
const itemKey = (id) => [...CAPABILITIES_KEY, 'item', id];

const data = (response) => response.data;

/**
 * Admin group shape: `{ _id, status, isLive, wasPublished, content, changes, hasDraft, order, publishedAt,
 * updatedAt }`. `content` (`{ title, icon, items }`) is the working copy (draft, else live).
 */
export function useCapabilityList() {
  return useQuery({ queryKey: LIST_KEY, queryFn: () => adminApi.get('/admin/skills').then(data) });
}

export function useCapability(id) {
  return useQuery({
    queryKey: itemKey(id),
    queryFn: () => adminApi.get(`/admin/skills/${id}`).then(data),
    refetchOnWindowFocus: false,
    retry: (count, error) => error?.status !== 404 && error?.status !== 400 && count < 2,
  });
}

/** Refreshes what the public site, the list and the overview show after a group changes. */
function useRefreshCapabilities() {
  const queryClient = useQueryClient();
  return ({ site = false } = {}) => {
    queryClient.invalidateQueries({ queryKey: LIST_KEY });
    queryClient.invalidateQueries({ queryKey: OVERVIEW_KEY });
    if (site) queryClient.invalidateQueries({ queryKey: SKILLS_KEY });
  };
}

/** New empty draft group at the end of the list; resolves with the admin item. */
export function useCreateCapability() {
  const queryClient = useQueryClient();
  const refresh = useRefreshCapabilities();
  return useMutation({
    mutationFn: () => adminApi.post('/admin/skills').then(data),
    onSuccess: (item) => {
      queryClient.setQueryData(itemKey(item._id), item);
      refresh();
    },
  });
}

/** `mutateAsync(content)` saves the whole draft; only the publish bookkeeping is copied into the cache. */
export function useSaveCapabilityDraft(id) {
  const queryClient = useQueryClient();
  const refresh = useRefreshCapabilities();
  return useMutation({
    mutationFn: (content) => adminApi.put(`/admin/skills/${id}`, content).then(data),
    onSuccess: ({ changes, hasDraft, updatedAt }) => {
      queryClient.setQueryData(itemKey(id), (item) => (item ? { ...item, changes, hasDraft, updatedAt } : item));
      refresh();
    },
  });
}

/** Publish / unpublish / discard replace the cached item and refresh the site. */
function useCapabilityAction(id, path) {
  const queryClient = useQueryClient();
  const refresh = useRefreshCapabilities();
  return useMutation({
    mutationFn: () => adminApi.post(`/admin/skills/${id}/${path}`).then(data),
    onSuccess: (item) => {
      queryClient.setQueryData(itemKey(id), item);
      refresh({ site: true });
    },
  });
}

export const usePublishCapability = (id) => useCapabilityAction(id, 'publish');
export const useUnpublishCapability = (id) => useCapabilityAction(id, 'unpublish');
export const useDiscardCapability = (id) => useCapabilityAction(id, 'discard');

export function useDeleteCapability(id) {
  const queryClient = useQueryClient();
  const refresh = useRefreshCapabilities();
  return useMutation({
    mutationFn: () => adminApi.delete(`/admin/skills/${id}`).then(data),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: itemKey(id) });
      refresh({ site: true });
    },
  });
}

/** `mutate(items)` saves a new display order. The list moves at once; on failure it goes back and `error` is set. */
export function useReorderCapabilities() {
  const queryClient = useQueryClient();
  const refresh = useRefreshCapabilities();
  return useMutation({
    mutationFn: (items) => adminApi.put('/admin/skills/order', { ids: items.map((item) => item._id) }).then(data),
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

/** The "Tools & Methods" heading (saved straight to the site). */
export function useSkillsSection() {
  return useQuery({ queryKey: SECTION_KEY, queryFn: () => adminApi.get('/admin/skills/section').then(data) });
}

export function useSaveSkillsSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (section) => adminApi.put('/admin/skills/section', section).then(data),
    onSuccess: (section) => {
      queryClient.setQueryData(SECTION_KEY, section);
      queryClient.invalidateQueries({ queryKey: SKILLS_KEY });
    },
  });
}

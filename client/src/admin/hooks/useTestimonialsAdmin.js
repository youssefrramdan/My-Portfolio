import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TESTIMONIALS_KEY } from '@/features/testimonials/useTestimonials';
import adminApi from '../lib/adminApi';
import { ADMIN_KEY } from './useAuth';
import { OVERVIEW_KEY } from './useOverview';

export const ADMIN_TESTIMONIALS_KEY = [...ADMIN_KEY, 'testimonials'];
const LIST_KEY = [...ADMIN_TESTIMONIALS_KEY, 'list'];
const SECTION_KEY = [...ADMIN_TESTIMONIALS_KEY, 'section'];
const itemKey = (id) => [...ADMIN_TESTIMONIALS_KEY, 'item', id];

const data = (response) => response.data;

/**
 * Admin testimonial shape: `{ _id, status (pending | draft | published), source (visitor | admin), isLive,
 * wasPublished, content, changes, hasDraft, order, publishedAt, createdAt, updatedAt }`. `content`
 * (`{ name, role, avatar, message }`) is the working copy. The list has the pending ones first.
 */
export function useTestimonialList() {
  return useQuery({ queryKey: LIST_KEY, queryFn: () => adminApi.get('/admin/testimonials').then(data) });
}

export function useTestimonial(id) {
  return useQuery({
    queryKey: itemKey(id),
    queryFn: () => adminApi.get(`/admin/testimonials/${id}`).then(data),
    refetchOnWindowFocus: false,
    retry: (count, error) => error?.status !== 404 && error?.status !== 400 && count < 2,
  });
}

/** Refreshes what the public site, the list and the overview (pending count) show after a testimonial changes. */
function useRefreshTestimonials() {
  const queryClient = useQueryClient();
  return ({ site = false } = {}) => {
    queryClient.invalidateQueries({ queryKey: LIST_KEY });
    queryClient.invalidateQueries({ queryKey: OVERVIEW_KEY });
    if (site) queryClient.invalidateQueries({ queryKey: TESTIMONIALS_KEY });
  };
}

/** New empty draft written by the admin; resolves with the admin item. */
export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  const refresh = useRefreshTestimonials();
  return useMutation({
    mutationFn: () => adminApi.post('/admin/testimonials').then(data),
    onSuccess: (item) => {
      queryClient.setQueryData(itemKey(item._id), item);
      refresh();
    },
  });
}

/** `mutateAsync(content)` saves the whole draft; only the publish bookkeeping is copied into the cache. */
export function useSaveTestimonialDraft(id) {
  const queryClient = useQueryClient();
  const refresh = useRefreshTestimonials();
  return useMutation({
    mutationFn: (content) => adminApi.put(`/admin/testimonials/${id}`, content).then(data),
    onSuccess: ({ changes, hasDraft, updatedAt }) => {
      queryClient.setQueryData(itemKey(id), (item) => (item ? { ...item, changes, hasDraft, updatedAt } : item));
      refresh();
    },
  });
}

/** Publish (= approve) / unpublish (= move to draft) / discard replace the cached item and refresh the site. */
function useTestimonialAction(id, path) {
  const queryClient = useQueryClient();
  const refresh = useRefreshTestimonials();
  return useMutation({
    mutationFn: () => adminApi.post(`/admin/testimonials/${id}/${path}`).then(data),
    onSuccess: (item) => {
      queryClient.setQueryData(itemKey(id), item);
      refresh({ site: true });
    },
  });
}

export const usePublishTestimonial = (id) => useTestimonialAction(id, 'publish');
export const useUnpublishTestimonial = (id) => useTestimonialAction(id, 'unpublish');
export const useDiscardTestimonial = (id) => useTestimonialAction(id, 'discard');

/** Also how a pending testimonial is rejected. */
export function useDeleteTestimonial(id) {
  const queryClient = useQueryClient();
  const refresh = useRefreshTestimonials();
  return useMutation({
    mutationFn: () => adminApi.delete(`/admin/testimonials/${id}`).then(data),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: itemKey(id) });
      refresh({ site: true });
    },
  });
}

/** The "What People Say" heading + invite block (saved straight to the site). */
export function useTestimonialsSection() {
  return useQuery({ queryKey: SECTION_KEY, queryFn: () => adminApi.get('/admin/testimonials/section').then(data) });
}

export function useSaveTestimonialsSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (section) => adminApi.put('/admin/testimonials/section', section).then(data),
    onSuccess: (section) => {
      queryClient.setQueryData(SECTION_KEY, section);
      queryClient.invalidateQueries({ queryKey: TESTIMONIALS_KEY });
    },
  });
}

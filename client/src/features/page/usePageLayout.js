import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const PAGE_KEY = ['page'];

/**
 * `{ sections, navLabels }`: keys of the visible home sections in display order, e.g. `['hero', 'skills', ...]`, and
 * the navbar label of each (`{ hero: 'About', ... }`).
 */
export function usePageLayout() {
  return useQuery({
    queryKey: PAGE_KEY,
    queryFn: async () => (await api.get('/page')).data,
  });
}

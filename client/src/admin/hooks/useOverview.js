import { useQuery } from '@tanstack/react-query';
import adminApi from '../lib/adminApi';
import { ADMIN_KEY } from './useAuth';

export const OVERVIEW_KEY = [...ADMIN_KEY, 'overview'];

/** Counts, setup progress, sections and recent work for the Overview page (and the sidebar badge). */
export function useOverview() {
  return useQuery({
    queryKey: OVERVIEW_KEY,
    queryFn: () => adminApi.get('/admin/overview').then((response) => response.data),
    staleTime: 30 * 1000,
  });
}

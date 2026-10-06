import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const SITE_STATUS_KEY = ['site-status'];

/** `{ isPublished, isAdmin, comingSoon, contactEmail, backgroundName }`. Depends on the session cookie. */
export function useSiteStatus() {
  return useQuery({
    queryKey: SITE_STATUS_KEY,
    queryFn: async () => (await api.get('/site-status')).data,
  });
}

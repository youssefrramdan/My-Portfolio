import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SEO_KEY } from '@/features/seo/useDocumentSeo';
import { SETTINGS_KEY } from '@/features/settings/useSettings';
import { SITE_STATUS_KEY } from '@/features/site/useSiteStatus';
import adminApi from '../lib/adminApi';
import { ADMIN_KEY } from './useAuth';
import { ADMIN_CONTACT_KEY } from './useContactAdmin';
import { OVERVIEW_KEY } from './useOverview';

export const ADMIN_SETTINGS_KEY = [...ADMIN_KEY, 'settings'];

/** `{ general, seo, comingSoon, defaults: { siteUrl, image }, isPublished }` for the Settings pages. */
export function useSettingsState() {
  return useQuery({
    queryKey: ADMIN_SETTINGS_KEY,
    queryFn: () => adminApi.get('/admin/settings').then((response) => response.data),
    refetchOnWindowFocus: false,
  });
}

/**
 * `mutateAsync(payload)` for one tab (`general` | `seo` | `coming-soon`), saved straight to the site (autosave). The
 * saved state replaces the cache so the other tabs open with it (an open form only reads it on mount, so typing is
 * kept); the public site, the Contact page (same contact email), the Overview (site address) and the page head are
 * refreshed.
 */
export function useSaveSettings(tab) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => adminApi.put(`/admin/settings/${tab}`, payload).then((response) => response.data),
    onSuccess: (state) => {
      queryClient.setQueryData(ADMIN_SETTINGS_KEY, state);
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
      queryClient.invalidateQueries({ queryKey: SEO_KEY });
      queryClient.invalidateQueries({ queryKey: SITE_STATUS_KEY });
      queryClient.invalidateQueries({ queryKey: ADMIN_CONTACT_KEY });
      queryClient.invalidateQueries({ queryKey: OVERVIEW_KEY });
    },
  });
}

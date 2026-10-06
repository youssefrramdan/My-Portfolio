import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SITE_STATUS_KEY } from '@/features/site/useSiteStatus';
import adminApi from '../lib/adminApi';
import { OVERVIEW_KEY } from './useOverview';

/**
 * `mutate(true)` publishes, `mutate(false)` unpublishes. Resolves once the overview (checklist, status card)
 * and the public site status have been refetched, so every publish control flips together.
 */
export function useSetPublished() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publish) =>
      adminApi.post(`/admin/site/${publish ? 'publish' : 'unpublish'}`).then((response) => response.data),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: OVERVIEW_KEY }),
        queryClient.invalidateQueries({ queryKey: SITE_STATUS_KEY }),
      ]),
  });
}

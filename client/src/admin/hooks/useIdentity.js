import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { HERO_KEY } from '@/features/hero/useHero';
import { SETTINGS_KEY } from '@/features/settings/useSettings';
import adminApi from '../lib/adminApi';
import { ADMIN_KEY } from './useAuth';
import { OVERVIEW_KEY } from './useOverview';

export const IDENTITY_KEY = [...ADMIN_KEY, 'identity'];

/**
 * Identity editor state: `{ identity (draft, else published), changes, hasDraft, draftSavedAt, contactEmail,
 * sections }`.
 */
export function useIdentity() {
  return useQuery({
    queryKey: IDENTITY_KEY,
    queryFn: () => adminApi.get('/admin/identity').then((response) => response.data),
    refetchOnWindowFocus: false,
  });
}

/**
 * `mutateAsync(identity)` saves the whole draft. Only the publish bookkeeping (`changes`, `hasDraft`,
 * `draftSavedAt`) is copied into the cache: the form keeps what the user is typing.
 */
export function useSaveIdentityDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (identity) => adminApi.put('/admin/identity', identity).then((response) => response.data),
    onSuccess: ({ changes, hasDraft, draftSavedAt }) => {
      queryClient.setQueryData(IDENTITY_KEY, (state) => (state ? { ...state, changes, hasDraft, draftSavedAt } : state));
    },
  });
}

/** Publish / discard replace the cached state and refresh what the public site and the overview show. */
function useIdentityAction(path) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.post(`/admin/identity/${path}`).then((response) => response.data),
    onSuccess: (state) => {
      queryClient.setQueryData(IDENTITY_KEY, state);
      if (path === 'publish') {
        queryClient.invalidateQueries({ queryKey: HERO_KEY });
        queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
        queryClient.invalidateQueries({ queryKey: OVERVIEW_KEY });
      }
    },
  });
}

export const usePublishIdentity = () => useIdentityAction('publish');
export const useDiscardIdentity = () => useIdentityAction('discard');

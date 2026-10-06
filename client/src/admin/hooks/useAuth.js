import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SITE_STATUS_KEY } from '@/features/site/useSiteStatus';
import adminApi from '../lib/adminApi';

export const ADMIN_KEY = ['admin'];
export const ME_KEY = [...ADMIN_KEY, 'me'];

/** The logged-in admin `{ name, title, email, avatar }`, or `null` when there is no valid session. */
export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: () =>
      adminApi
        .get('/auth/me')
        .then((response) => response.data)
        .catch((error) => {
          if (error.status === 401) return null;
          throw error;
        }),
    retry: false,
  });
}

/** The public site status carries `isAdmin`, so it is refreshed whenever the session changes. */
export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (credentials) => adminApi.post('/auth/login', credentials).then((response) => response.data),
    onSuccess: (user) => {
      queryClient.setQueryData(ME_KEY, user);
      queryClient.invalidateQueries({ queryKey: SITE_STATUS_KEY });
    },
  });
}

/** Clears the cookie, then drops every cached admin query so nothing from the session lingers. */
export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => adminApi.post('/auth/logout'),
    onSettled: () => {
      queryClient.removeQueries({ queryKey: ADMIN_KEY });
      queryClient.setQueryData(ME_KEY, null);
      queryClient.invalidateQueries({ queryKey: SITE_STATUS_KEY });
    },
  });
}

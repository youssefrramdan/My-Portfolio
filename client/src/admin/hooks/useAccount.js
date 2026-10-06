import { useMutation, useQueryClient } from '@tanstack/react-query';
import adminApi from '../lib/adminApi';
import { ME_KEY } from './useAuth';

/** Profile card (name, title, photo): the sidebar user card updates from the saved profile. */
export function useSaveProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (profile) => adminApi.put('/admin/account/profile', profile).then((response) => response.data),
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  });
}

/** `mutate({ email, currentPassword })`: the login email. */
export function useChangeEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => adminApi.put('/admin/account/email', body).then((response) => response.data),
    onSuccess: (user) => queryClient.setQueryData(ME_KEY, user),
  });
}

/** `mutate({ currentPassword, newPassword })`: other devices are signed out, this one stays signed in. */
export function useChangePassword() {
  return useMutation({
    mutationFn: (body) => adminApi.put('/admin/account/password', body),
  });
}

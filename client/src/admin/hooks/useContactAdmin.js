import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CONTACT_KEY } from '@/features/contact/useContact';
import { SETTINGS_KEY } from '@/features/settings/useSettings';
import adminApi from '../lib/adminApi';
import { ADMIN_KEY } from './useAuth';
import { IDENTITY_KEY } from './useIdentity';
import { OVERVIEW_KEY } from './useOverview';
import { ADMIN_SETTINGS_KEY } from './useSettingsAdmin';

export const ADMIN_CONTACT_KEY = [...ADMIN_KEY, 'contact'];

const fetchContact = () => adminApi.get('/admin/contact').then((response) => response.data);

/**
 * Contact page state: `{ contactEmail, socials: [{ platform, url }], section (heading + buttons), sections (scroll
 * targets), hasCv }`.
 */
export function useContactState() {
  return useQuery({ queryKey: ADMIN_CONTACT_KEY, queryFn: fetchContact, refetchOnWindowFocus: false });
}

/** Only the section heading, for the "Main Details" card. */
export function useContactSection() {
  return useQuery({ queryKey: ADMIN_CONTACT_KEY, queryFn: fetchContact, refetchOnWindowFocus: false, select: (state) => state.section });
}

/** Refreshes the public Contact section / social icons, the Identity email note, Settings (same email) and the overview checklist. */
function useRefreshContact() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: CONTACT_KEY });
    queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
    queryClient.invalidateQueries({ queryKey: ADMIN_SETTINGS_KEY });
    queryClient.invalidateQueries({ queryKey: IDENTITY_KEY });
    queryClient.invalidateQueries({ queryKey: OVERVIEW_KEY });
  };
}

/**
 * `mutateAsync({ contactEmail, socials, primaryCta, secondaryCta })` saves straight to the site (autosave). The cache
 * is not replaced, so the form keeps what the user is typing.
 */
export function useSaveContact() {
  const refresh = useRefreshContact();
  return useMutation({
    mutationFn: (contact) => adminApi.put('/admin/contact', contact).then((response) => response.data),
    onSuccess: refresh,
  });
}

/** The "Let's Work Together" heading (saved straight to the site). */
export function useSaveContactSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (section) => adminApi.put('/admin/contact/section', section).then((response) => response.data),
    onSuccess: (section) => {
      queryClient.setQueryData(ADMIN_CONTACT_KEY, (state) => (state ? { ...state, section: { ...state.section, ...section } } : state));
      queryClient.invalidateQueries({ queryKey: CONTACT_KEY });
    },
  });
}

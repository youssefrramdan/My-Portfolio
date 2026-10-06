import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const CONTACT_KEY = ['contact'];

/** `{ section }`: badge, title, description and the two `{ label, action, target }` buttons. */
export function useContact() {
  return useQuery({
    queryKey: CONTACT_KEY,
    queryFn: async () => (await api.get('/contact')).data,
  });
}

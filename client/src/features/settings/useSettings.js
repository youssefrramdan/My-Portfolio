import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const SETTINGS_KEY = ['settings'];

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_KEY,
    queryFn: async () => (await api.get('/settings')).data,
  });
}

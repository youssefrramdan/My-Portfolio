import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const HERO_KEY = ['hero'];

export function useHero() {
  return useQuery({
    queryKey: HERO_KEY,
    queryFn: async () => (await api.get('/hero')).data,
  });
}

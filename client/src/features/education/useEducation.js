import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const EDUCATION_KEY = ['education'];

/**
 * `{ section, educations, certificates }`: heading, every published education credential (degree / diploma cards)
 * and the other published credentials, in order.
 */
export function useEducation() {
  return useQuery({
    queryKey: EDUCATION_KEY,
    queryFn: async () => (await api.get('/education')).data,
  });
}

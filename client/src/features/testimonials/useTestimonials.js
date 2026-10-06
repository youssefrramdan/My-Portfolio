import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const TESTIMONIALS_KEY = ['testimonials'];

/** `{ section, testimonials }`: heading + CTA copy and the published testimonials in display order. */
export function useTestimonials() {
  return useQuery({
    queryKey: TESTIMONIALS_KEY,
    queryFn: async () => (await api.get('/testimonials')).data,
  });
}

/**
 * Sends `{ name, role, message, website }` to the public form endpoint. The testimonial is saved as pending,
 * so the public list does not change until it is approved.
 */
export function useSubmitTestimonial() {
  return useMutation({
    mutationFn: (payload) => api.post('/testimonials', payload),
  });
}

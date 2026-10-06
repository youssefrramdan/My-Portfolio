import { useQuery } from '@tanstack/react-query';
import api from '@/lib/axios';

export const PROJECTS_KEY = ['projects'];

/** `{ section, projects }`: the heading and the published featured projects in display order. */
export function useProjects() {
  return useQuery({
    queryKey: PROJECTS_KEY,
    queryFn: async () => (await api.get('/projects')).data,
  });
}

/** `{ section, projects }` with every published project (the "All projects" page). */
export function useAllProjects() {
  return useQuery({
    queryKey: [...PROJECTS_KEY, { scope: 'all' }],
    queryFn: async () => (await api.get('/projects', { params: { scope: 'all' } })).data,
  });
}

/** One published project by slug, with its gallery (404 -> error). */
export function useProject(slug) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, slug],
    queryFn: async () => (await api.get(`/projects/${slug}`)).data,
    enabled: Boolean(slug),
    retry: false,
  });
}

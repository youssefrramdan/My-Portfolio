import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PAGE_KEY } from '@/features/page/usePageLayout';
import adminApi from '../lib/adminApi';
import { ADMIN_KEY } from './useAuth';
import { OVERVIEW_KEY } from './useOverview';

export const ADMIN_PAGE_KEY = [...ADMIN_KEY, 'page'];

/**
 * Page screen state: `{ sections: [{ key, isVisible, navLabel, order, label, source, type, defaultNavLabel, title,
 * hasContent }], problems: [{ key, kind, message }] }`.
 */
export function usePageState() {
  return useQuery({
    queryKey: ADMIN_PAGE_KEY,
    queryFn: () => adminApi.get('/admin/page').then((response) => response.data),
    // Titles, content and warnings change from every content module, so read them again on each visit.
    staleTime: 0,
  });
}

/**
 * `mutateAsync(sections)` saves the order (array position), visibility and navbar label of every home section in one
 * request. The Page state takes the saved result, the cached overview takes the saved order (keeping its own
 * fields) and the public layout is refetched.
 */
export function useSavePageLayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sections) =>
      adminApi
        .put('/admin/page', { sections: sections.map(({ key, isVisible, navLabel }) => ({ key, isVisible, navLabel })) })
        .then((response) => response.data),
    onSuccess: (saved) => {
      queryClient.setQueryData(ADMIN_PAGE_KEY, saved);
      queryClient.setQueryData(OVERVIEW_KEY, (overview) =>
        overview
          ? {
              ...overview,
              sections: saved.sections.map((section) => ({
                ...overview.sections.find((current) => current.key === section.key),
                ...section,
              })),
            }
          : overview,
      );
      queryClient.invalidateQueries({ queryKey: PAGE_KEY });
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { renderSeoHead } from '@shared/seo';
import api from '@/lib/axios';

export const SEO_KEY = ['seo'];

/** Swaps every tag the server (or a previous page) put in `<head>` for the ones of `page`. */
function applySeoHead(page) {
  document.head.querySelectorAll('[data-seo], title').forEach((node) => node.remove());
  document.head.insertAdjacentHTML('beforeend', renderSeoHead(page));
  if (page.lang) document.documentElement.lang = page.lang;
}

/**
 * Keeps the title, description, canonical link, sharing tags and JSON-LD in sync with the current public page while
 * the visitor moves around the app. The first HTML already has them (Vercel middleware / Vite dev server), so
 * crawlers that do not run JavaScript see the same tags.
 */
export function useDocumentSeo() {
  const { pathname } = useLocation();
  const { data } = useQuery({
    queryKey: [...SEO_KEY, pathname],
    queryFn: async () => (await api.get('/seo', { params: { path: pathname } })).data,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (data) applySeoHead(data);
  }, [data]);
}

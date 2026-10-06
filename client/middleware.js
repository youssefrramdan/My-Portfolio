import { next } from '@vercel/functions';
import { injectSeoHead } from '../shared/seo.js';

/**
 * Vercel Routing Middleware: the public pages are a single-page app, so the first HTML would only have the generic
 * title. This puts the real title, description, canonical link, sharing tags and JSON-LD of the page (from the API
 * function on the same deployment, `GET /api/seo`) in that HTML, so Google and link previews (WhatsApp, LinkedIn, X…)
 * read them without running JavaScript. Unknown project pages get a real 404. If anything fails, the plain app is
 * served. `API_ORIGIN` (optional) points it at an API on another host.
 */
export const config = {
  runtime: 'nodejs',
  matcher: ['/', '/projects', '/projects/:slug'],
};

// Leaves room for the API function's cold start (database connection) before falling back to the plain app.
const TIMEOUT_MS = 3500;
const CACHE_MS = 60 * 1000;
const MAX_CACHED_PAGES = 200;

/** Per-instance caches: the metadata for a minute (same as the API), the built `index.html` for the deployment. */
const pages = new Map();
let shell = null;

const apiOrigin = (origin) => (process.env.API_ORIGIN || origin).replace(/\/+$/, '');

async function loadPage(path, origin) {
  const cached = pages.get(path);
  if (cached && cached.expires > Date.now()) return cached.page;
  const response = await fetch(`${apiOrigin(origin)}/api/seo?path=${encodeURIComponent(path)}`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`SEO request failed (${response.status})`);
  const { data } = await response.json();
  if (pages.size >= MAX_CACHED_PAGES) pages.clear();
  pages.set(path, { page: data, expires: Date.now() + CACHE_MS });
  return data;
}

async function loadShell(origin) {
  if (shell) return shell;
  const response = await fetch(new URL('/index.html', origin), { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!response.ok) throw new Error(`index.html request failed (${response.status})`);
  shell = await response.text();
  return shell;
}

export default async function middleware(request) {
  if (request.method !== 'GET') return next();
  const url = new URL(request.url);
  try {
    const [page, html] = await Promise.all([loadPage(url.pathname, url.origin), loadShell(url.origin)]);
    return new Response(injectSeoHead(html, page), {
      status: page?.status ?? 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[seo-middleware]', error.message);
    return next();
  }
}

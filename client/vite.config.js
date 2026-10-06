import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { injectSeoHead } from '../shared/seo.js';

const API_TARGET = 'http://localhost:5050';
const SEO_TIMEOUT_MS = 1500;

/**
 * Dev only: puts the public page's real `<head>` tags (from `GET /api/seo`) in the served HTML, like the Vercel
 * middleware does in production, so "view source" and SEO tools see them locally. Falls back to the plain HTML.
 */
function seoHead() {
  return {
    name: 'portfolio-seo-head',
    apply: 'serve',
    async transformIndexHtml(html, ctx) {
      const path = new URL(ctx.originalUrl ?? ctx.path, 'http://localhost').pathname;
      if (path === '/admin' || path.startsWith('/admin/')) return html;
      try {
        const response = await fetch(`${API_TARGET}/api/seo?path=${encodeURIComponent(path)}`, { signal: AbortSignal.timeout(SEO_TIMEOUT_MS) });
        if (!response.ok) return html;
        const { data } = await response.json();
        return injectSeoHead(html, data);
      } catch {
        return html;
      }
    },
  };
}

const seoFile = (file) => ({ target: API_TARGET, changeOrigin: true, rewrite: () => `/api/seo/${file}` });

export default defineConfig({
  plugins: [react(), tailwindcss(), seoHead()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@shared': fileURLToPath(new URL('../shared', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
      '/sitemap.xml': seoFile('sitemap.xml'),
      '/robots.txt': seoFile('robots.txt'),
    },
  },
});

/**
 * Turns the page metadata from `GET /api/seo?path=` into `<head>` tags. Used by the Vercel middleware (real HTML for
 * crawlers and link previews), the Vite dev server and the public app (when it navigates between pages).
 * Every tag carries `data-seo` so the app can swap the whole set without duplicates.
 */
const SEO_BLOCK = /<!--seo-head-->[\s\S]*?<!--\/seo-head-->/;

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ESCAPES[char]);

/** JSON inside `<script>` must never close the tag early. */
const safeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const meta = (attr, key, content) => (content ? `<meta data-seo ${attr}="${escape(key)}" content="${escape(content)}">` : '');
const link = (rel, href, extra = '') => (href ? `<link data-seo rel="${rel}" href="${escape(href)}"${extra}>` : '');

export function renderSeoHead(page) {
  if (!page) return '';
  const image = page.image;
  return [
    `<title data-seo>${escape(page.title)}</title>`,
    meta('name', 'description', page.description),
    meta('name', 'robots', page.robots),
    link('canonical', page.canonical),
    link('icon', page.favicon),
    link('apple-touch-icon', page.appleTouchIcon),
    meta('name', 'google-site-verification', page.verification?.google),
    meta('property', 'og:type', page.type),
    meta('property', 'og:site_name', page.siteName),
    meta('property', 'og:locale', page.locale),
    meta('property', 'og:title', page.title),
    meta('property', 'og:description', page.description),
    meta('property', 'og:url', page.canonical),
    meta('property', 'og:image', image?.url),
    meta('property', 'og:image:width', image?.width),
    meta('property', 'og:image:height', image?.height),
    meta('property', 'og:image:alt', image?.alt),
    meta('name', 'twitter:card', image ? 'summary_large_image' : 'summary'),
    meta('name', 'twitter:title', page.title),
    meta('name', 'twitter:description', page.description),
    meta('name', 'twitter:image', image?.url),
    meta('name', 'twitter:image:alt', image?.alt),
    ...(page.jsonLd ?? []).map((data) => `<script data-seo type="application/ld+json">${safeJson(data)}</script>`),
  ]
    .filter(Boolean)
    .join('\n    ');
}

/**
 * Swaps the fallback block of `index.html` (`<!--seo-head-->…<!--/seo-head-->`: generic title + description, used
 * only when the metadata cannot be loaded) for the page tags.
 */
export function injectSeoHead(html, page) {
  const head = renderSeoHead(page);
  if (!head) return html;
  const withLang = page.lang ? html.replace(/<html lang="[^"]*"/i, `<html lang="${escape(page.lang)}"`) : html;
  return SEO_BLOCK.test(withLang) ? withLang.replace(SEO_BLOCK, () => head) : withLang.replace('</head>', () => `${head}\n  </head>`);
}

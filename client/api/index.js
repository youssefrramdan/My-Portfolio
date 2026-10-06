import app from '../../server/src/app.js';
import { connectDB } from '../../server/src/config/db.js';
import '../../server/src/config/cloudinary.js';

/** Public files served by the SEO module (`vercel.json` sends them here with their own path). */
const SEO_FILES = { '/sitemap.xml': '/api/seo/sitemap.xml', '/robots.txt': '/api/seo/robots.txt' };
/** The `vercel.json` rewrite's named segment, which Vercel adds to the query string (named so it never collides). */
const ROUTE_PARAM = 'vercelApiPath';

/**
 * Vercel Function running the Express API (`server/`). `vercel.json` rewrites `/api/*`, `/sitemap.xml` and
 * `/robots.txt` here; Vercel keeps the original path in `req.url`, so the Express routes match as on a server.
 */
export default async function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  url.searchParams.delete(ROUTE_PARAM);
  req.url = (SEO_FILES[url.pathname] ?? url.pathname) + url.search;

  try {
    await connectDB();
  } catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ success: false, data: null, message: 'Service temporarily unavailable, please try again.' }));
    return;
  }
  app(req, res);
}

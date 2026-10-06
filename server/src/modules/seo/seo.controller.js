import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { getPageSeo, getRobots, getSitemap } from './seo.service.js';

const PATH_MAX = 300;

/**
 * GET /api/seo?path=/projects/x: title, description, canonical URL, sharing image, robots and JSON-LD for a public
 * page (read by the Vercel middleware and the public app). Short cache: the dashboard edits go live within a minute.
 */
export const getSeo = asyncHandler(async (req, res) => {
  const path = typeof req.query.path === 'string' ? req.query.path.slice(0, PATH_MAX) : '/';
  res.set('Cache-Control', 'public, max-age=60');
  sendSuccess(res, await getPageSeo(path));
});

/** GET /api/seo/sitemap.xml (served as /sitemap.xml on the site) */
export const sitemap = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.type('application/xml').send(await getSitemap());
});

/** GET /api/seo/robots.txt (served as /robots.txt on the site) */
export const robots = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.type('text/plain').send(await getRobots());
});

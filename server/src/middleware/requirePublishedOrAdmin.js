import SiteStatus, { DEFAULT_IS_PUBLISHED } from '../modules/site/siteStatus.model.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { loadUser } from './requireAuth.js';

/** Public content is served only while the site is published; the logged-in admin always gets it. */
const requirePublishedOrAdmin = asyncHandler(async (req, res, next) => {
  const status = await SiteStatus.findOne().select('isPublished').lean();
  if (status?.isPublished ?? DEFAULT_IS_PUBLISHED) return next();
  if (await loadUser(req)) return next();
  throw new ApiError('Site is not published', 503);
});

export default requirePublishedOrAdmin;

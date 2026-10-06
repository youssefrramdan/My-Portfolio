import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import Hero from '../hero/hero.model.js';
import Settings from '../settings/settings.model.js';
import SiteStatus, { DEFAULT_IS_PUBLISHED } from './siteStatus.model.js';

const SINGLETON_UPDATE = { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true };

/**
 * GET /api/site-status (optionalAuth): whether the site is live, whether the caller is the admin,
 * and everything the Coming Soon page needs. The answer depends on the cookie, so it is never cached.
 */
export const getSiteStatus = asyncHandler(async (req, res) => {
  const [status, settings, hero] = await Promise.all([
    SiteStatus.findOne().select('isPublished comingSoon').lean(),
    Settings.findOne().select('contactEmail').lean(),
    Hero.findOne().select('backgroundText').lean(),
  ]);
  res.set('Cache-Control', 'no-store');
  sendSuccess(res, {
    isPublished: status?.isPublished ?? DEFAULT_IS_PUBLISHED,
    isAdmin: Boolean(req.user),
    comingSoon: status?.comingSoon ?? null,
    contactEmail: settings?.contactEmail ?? '',
    backgroundName: hero?.backgroundText ?? '',
  });
});

const setPublished = (isPublished) =>
  asyncHandler(async (req, res) => {
    const status = await SiteStatus.findOneAndUpdate(
      {},
      { isPublished, publishedAt: isPublished ? new Date() : null },
      SINGLETON_UPDATE,
    )
      .select('isPublished publishedAt')
      .lean();
    sendSuccess(res, status, isPublished ? 'Site published' : 'Site unpublished');
  });

/** POST /api/admin/site/publish */
export const publishSite = setPublished(true);

/** POST /api/admin/site/unpublish */
export const unpublishSite = setPublished(false);

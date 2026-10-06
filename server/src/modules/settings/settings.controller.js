import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import Settings from './settings.model.js';
import { getSettingsState, saveComingSoon, saveGeneral, saveSeo } from './settings.service.js';
import SocialLink from './socialLink.model.js';

const HIDDEN_FIELDS = '-__v -createdAt -updatedAt';
const SOCIAL_SORT = { order: 1, createdAt: 1 };

/**
 * GET /api/settings: site-wide data plus the active social links in display order (`{ platform, url }`).
 * Returns null until the settings are seeded or saved from the dashboard.
 */
export const getSettings = asyncHandler(async (req, res) => {
  const [settings, socials] = await Promise.all([
    Settings.findOne().select(HIDDEN_FIELDS).lean(),
    SocialLink.find({ isActive: true }).sort(SOCIAL_SORT).select('platform url -_id').lean(),
  ]);
  sendSuccess(res, settings && { ...settings, socials });
});

/** GET /api/admin/settings */
export const getAdminSettings = asyncHandler(async (req, res) => {
  sendSuccess(res, await getSettingsState());
});

/** PUT /api/admin/settings/general (autosave, live right away) */
export const updateGeneral = asyncHandler(async (req, res) => {
  sendSuccess(res, await saveGeneral(req.body), 'Settings saved');
});

/** PUT /api/admin/settings/seo (autosave, live right away) */
export const updateSeo = asyncHandler(async (req, res) => {
  sendSuccess(res, await saveSeo(req.body), 'SEO saved');
});

/** PUT /api/admin/settings/coming-soon (autosave) */
export const updateComingSoon = asyncHandler(async (req, res) => {
  sendSuccess(res, await saveComingSoon(req.body), 'Coming soon page saved');
});

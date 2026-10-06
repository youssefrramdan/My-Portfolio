import { DEFAULT_BRAND_COLOR } from '../../../shared/settings.js';
import Settings from '../../src/modules/settings/settings.model.js';
import { uploadAsset } from '../lib/uploadAsset.js';

/** Settings > General / SEO defaults. Only filled in while empty: they are edited in Settings. */
export const SITE_DEFAULTS = {
  siteName: 'Youssef Ramadan - Backend Software Engineer',
  seo: {
    title: 'Youssef Ramadan - Backend Software Engineer',
    description: 'Backend software engineer building secure, scalable and reliable systems and APIs.',
  },
};

/**
 * Avatar from the Figma NavBar (node 616:14120), footer copy from the Figma footer (616:14085).
 * `findOneAndReplace` rewrites the whole document, so fields that were dropped from the model disappear on re-run.
 * What the dashboard edits (CV, site name / address, SEO, favicon, contact email, footer text, brand color) is kept;
 * the defaults only fill empty values.
 */
export default async function seedSettings({ force }) {
  const avatar = await uploadAsset('hero/nav-logo.png', {
    folder: 'settings',
    name: 'nav-logo',
    alt: 'Youssef Ramadan avatar',
    force,
  });

  const current = await Settings.findOne().select('cv siteName siteUrl seo favicon contactEmail footer brandColor').lean();
  const data = {
    avatar,
    cv: current?.cv ?? {},
    siteName: current?.siteName || SITE_DEFAULTS.siteName,
    siteUrl: current?.siteUrl ?? '',
    seo: {
      ...current?.seo,
      title: current?.seo?.title || SITE_DEFAULTS.seo.title,
      description: current?.seo?.description || SITE_DEFAULTS.seo.description,
    },
    favicon: current?.favicon ?? {},
    contactEmail: current?.contactEmail || 'hello@yousseframadan.dev', // TODO: placeholder, replace with the real address
    brandColor: current?.brandColor || DEFAULT_BRAND_COLOR,
    footer: {
      copyright: current?.footer?.copyright || '© 2026 YOUSEF RAMADAN',
      backToTopLabel: current?.footer?.backToTopLabel || 'Back Up',
    },
  };

  await Settings.findOneAndReplace({}, data, { upsert: true, runValidators: true });
  return Settings.countDocuments();
}

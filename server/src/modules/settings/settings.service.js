import { DEFAULT_BRAND_COLOR } from '../../../../shared/settings.js';
import { env } from '../../config/env.js';
import Hero from '../hero/hero.model.js';
import SiteStatus, { DEFAULT_IS_PUBLISHED } from '../site/siteStatus.model.js';
import Settings from './settings.model.js';

const SINGLETON_UPDATE = { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true };

const image = (value) => ({ url: value?.url ?? '', publicId: value?.publicId ?? '', alt: value?.alt ?? '' });

/** The public address: the one saved in General, else the server's CLIENT_URL. */
export const resolveSiteUrl = (settings) => (settings?.siteUrl || env.CLIENT_URL).replace(/\/+$/, '');

/**
 * Everything the Settings pages edit: `{ general, seo, comingSoon, defaults, isPublished }`. `defaults` is what is
 * used when a field is empty (server address, hero photo as the sharing image). The admin profile and login email
 * come from `/api/auth/me`.
 */
export async function getSettingsState() {
  const [settings, status, hero] = await Promise.all([
    Settings.findOne().select('siteName siteUrl brandColor contactEmail footer seo favicon').lean(),
    SiteStatus.findOne().select('isPublished comingSoon').lean(),
    Hero.findOne().select('photo').lean(),
  ]);
  const comingSoon = status?.comingSoon ?? {};
  return {
    general: {
      siteName: settings?.siteName ?? '',
      siteUrl: settings?.siteUrl ?? '',
      brandColor: settings?.brandColor || DEFAULT_BRAND_COLOR,
      contactEmail: settings?.contactEmail ?? '',
      footer: {
        copyright: settings?.footer?.copyright ?? '',
        backToTopLabel: settings?.footer?.backToTopLabel ?? '',
      },
    },
    seo: {
      title: settings?.seo?.title ?? '',
      description: settings?.seo?.description ?? '',
      image: image(settings?.seo?.image),
      googleVerification: settings?.seo?.googleVerification ?? '',
      favicon: image(settings?.favicon),
    },
    comingSoon: {
      badge: comingSoon.badge ?? '',
      title: { plain: comingSoon.title?.plain ?? '', highlight: comingSoon.title?.highlight ?? '' },
      message: comingSoon.message ?? '',
      description: comingSoon.description ?? '',
      image: image(comingSoon.image),
      showEmail: comingSoon.showEmail ?? true,
    },
    defaults: { siteUrl: env.CLIENT_URL.replace(/\/+$/, ''), image: image(hero?.photo) },
    isPublished: status?.isPublished ?? DEFAULT_IS_PUBLISHED,
  };
}

/**
 * General tab: site name, address, brand color, contact email (same field as the Contact page) and footer text.
 * Live right away.
 */
export async function saveGeneral({ siteName, siteUrl, brandColor, contactEmail, footer }) {
  await Settings.findOneAndUpdate(
    {},
    {
      siteName,
      siteUrl,
      brandColor,
      contactEmail,
      footer: { copyright: footer?.copyright ?? '', backToTopLabel: footer.backToTopLabel },
    },
    SINGLETON_UPDATE,
  );
  return getSettingsState();
}

/** SEO tab: default title / description / sharing image, Search Console code and favicon. */
export async function saveSeo({ title, description, image: shareImage, googleVerification, favicon }) {
  await Settings.findOneAndUpdate(
    {},
    { seo: { title, description, image: image(shareImage), googleVerification }, favicon: image(favicon) },
    SINGLETON_UPDATE,
  );
  return getSettingsState();
}

/** Coming soon tab. `isPublished` is left alone (it has its own Publish button). */
export async function saveComingSoon({ badge, title, message, description, image: picture, showEmail }) {
  await SiteStatus.findOneAndUpdate(
    {},
    { comingSoon: { badge, title: { plain: title.plain, highlight: title.highlight ?? '' }, message, description, image: image(picture), showEmail } },
    SINGLETON_UPDATE,
  );
  return getSettingsState();
}

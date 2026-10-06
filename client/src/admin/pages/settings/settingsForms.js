import { z } from 'zod';
import { CONTACT_LIMITS, EMAIL_PATTERN } from '@shared/contact';
import { HEX_COLOR } from '@shared/identity';
import {
  COMING_SOON_LIMITS,
  DEFAULT_BRAND_COLOR,
  PASSWORD_LIMITS,
  SEO_LIMITS,
  SETTINGS_LIMITS,
  siteOrigin,
  VERIFICATION_PATTERN,
} from '@shared/settings';
import { tooLong } from '../../lib/contentItems';
import { ACCOUNT, COMING_SOON, GENERAL, SEO } from './constants';

const text = (max) => z.string().max(max, tooLong(max));
const requiredText = (max, message) => z.string().trim().min(1, message).max(max, tooLong(max));
const image = z.object({ url: z.string(), publicId: z.string(), alt: text(SETTINGS_LIMITS.alt) });
const toImage = (value) => ({ url: value?.url ?? '', publicId: value?.publicId ?? '', alt: value?.alt ?? '' });

/** "yourname.com" -> "https://yourname.com" (what the server stores). */
export const toSiteUrl = (value) => siteOrigin(/^[a-z][a-z\d+.-]*:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`);
const isSiteUrl = (value) => {
  const url = toSiteUrl(value);
  return Boolean(url) && (new URL(url).hostname.includes('.') || new URL(url).hostname === 'localhost');
};

/** Same field as the Contact page. */
const contactEmail = z
  .string()
  .trim()
  .min(1, GENERAL.email.required)
  .max(CONTACT_LIMITS.email, tooLong(CONTACT_LIMITS.email))
  .regex(EMAIL_PATTERN, GENERAL.email.invalid);

/* ---------- General ---------- */

export const generalSchema = z.object({
  siteName: requiredText(SETTINGS_LIMITS.siteName, GENERAL.site.name.required),
  siteUrl: requiredText(SETTINGS_LIMITS.siteUrl, GENERAL.site.url.required).refine(isSiteUrl, GENERAL.site.url.invalid),
  brandColor: z.string().regex(HEX_COLOR, GENERAL.brand.invalid),
  contactEmail,
  footer: z.object({
    copyright: text(SETTINGS_LIMITS.copyright),
    backToTopLabel: requiredText(SETTINGS_LIMITS.backToTop, GENERAL.footer.backToTop.required),
  }),
});

/** An address that was never saved starts as the server's own (CLIENT_URL). */
export const generalToForm = ({ general, defaults }) => ({
  siteName: general.siteName,
  siteUrl: general.siteUrl || defaults.siteUrl,
  brandColor: general.brandColor || DEFAULT_BRAND_COLOR,
  contactEmail: general.contactEmail,
  footer: { ...general.footer },
});

export const generalToPayload = ({ siteName, siteUrl, brandColor, contactEmail: email, footer }) => ({
  siteName: siteName.trim(),
  siteUrl: toSiteUrl(siteUrl),
  brandColor: brandColor.toLowerCase(),
  contactEmail: email.trim(),
  footer: { copyright: footer.copyright.trim(), backToTopLabel: footer.backToTopLabel.trim() },
});

/* ---------- Profile (dashboard user card) ---------- */

export const profileSchema = z.object({
  name: requiredText(SETTINGS_LIMITS.profileName, GENERAL.profile.name.required),
  title: text(SETTINGS_LIMITS.profileTitle),
  avatar: image,
});

export const profileToForm = (user) => ({ name: user?.name ?? '', title: user?.title ?? '', avatar: toImage(user?.avatar) });

export const profileToPayload = ({ name, title, avatar }) => ({ name: name.trim(), title: title.trim(), avatar });

/* ---------- SEO ---------- */

/** Search Console gives a whole `<meta>` tag; only its `content` value is kept (the server does the same). */
export const verificationCode = (value) => {
  const raw = value.trim();
  return raw.match(/content\s*=\s*["']([^"']*)["']/i)?.[1]?.trim() ?? raw;
};

export const seoSchema = z.object({
  title: requiredText(SEO_LIMITS.title, SEO.sharing.seoTitle.required),
  description: requiredText(SEO_LIMITS.description, SEO.sharing.seoDescription.required),
  image,
  googleVerification: z
    .string()
    .refine((value) => verificationCode(value).length <= SEO_LIMITS.verification, tooLong(SEO_LIMITS.verification))
    .refine((value) => !verificationCode(value) || VERIFICATION_PATTERN.test(verificationCode(value)), SEO.engines.verification.invalid),
  favicon: image,
});

export const seoToForm = ({ seo }) => ({
  title: seo.title,
  description: seo.description,
  image: toImage(seo.image),
  googleVerification: seo.googleVerification,
  favicon: toImage(seo.favicon),
});

export const seoToPayload = ({ title, description, image: shareImage, googleVerification, favicon }) => ({
  title: title.trim(),
  description: description.trim(),
  image: shareImage,
  googleVerification: verificationCode(googleVerification),
  favicon,
});

/* ---------- Coming soon ---------- */

export const comingSoonSchema = z.object({
  badge: text(COMING_SOON_LIMITS.badge),
  title: z.object({
    plain: requiredText(COMING_SOON_LIMITS.title, COMING_SOON.content.plain.required),
    highlight: text(COMING_SOON_LIMITS.title),
  }),
  message: text(COMING_SOON_LIMITS.message),
  description: text(COMING_SOON_LIMITS.description),
  image,
  showEmail: z.boolean(),
});

export const comingSoonToForm = ({ comingSoon }) => ({
  badge: comingSoon.badge,
  title: { ...comingSoon.title },
  message: comingSoon.message,
  description: comingSoon.description,
  image: toImage(comingSoon.image),
  showEmail: comingSoon.showEmail,
});

export const comingSoonToPayload = ({ badge, title, message, description, image: picture, showEmail }) => ({
  badge: badge.trim(),
  title: { plain: title.plain.trim(), highlight: title.highlight.trim() },
  message: message.trim(),
  description: description.trim(),
  image: picture,
  showEmail,
});

/* ---------- Account ---------- */

const currentPassword = z.string().min(1, ACCOUNT.currentPassword.required).max(PASSWORD_LIMITS.max);

export const emailSchema = (currentEmail) =>
  z.object({
    email: z
      .string()
      .trim()
      .min(1, ACCOUNT.email.required)
      .max(254, ACCOUNT.email.invalid)
      .regex(EMAIL_PATTERN, ACCOUNT.email.invalid)
      .refine((value) => value.toLowerCase() !== currentEmail, ACCOUNT.email.same),
    currentPassword,
  });

export const passwordSchema = z
  .object({
    currentPassword,
    newPassword: z.string().min(1, ACCOUNT.password.required).min(PASSWORD_LIMITS.min, ACCOUNT.password.min).max(PASSWORD_LIMITS.max, ACCOUNT.password.max),
    confirmPassword: z.string(),
  })
  .superRefine(({ currentPassword: current, newPassword, confirmPassword }, context) => {
    if (newPassword && newPassword === current) context.addIssue({ code: 'custom', path: ['newPassword'], message: ACCOUNT.password.same });
    if (confirmPassword !== newPassword) context.addIssue({ code: 'custom', path: ['confirmPassword'], message: ACCOUNT.password.mismatch });
  });

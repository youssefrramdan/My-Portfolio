import { body } from 'express-validator';
import { CONTACT_LIMITS } from '../../../../shared/contact.js';
import { HEX_COLOR } from '../../../../shared/identity.js';
import {
  COMING_SOON_LIMITS,
  DEFAULT_BRAND_COLOR,
  SEO_LIMITS,
  SETTINGS_LIMITS,
  siteOrigin,
  VERIFICATION_PATTERN,
} from '../../../../shared/settings.js';
import validate from '../../middleware/validate.js';
import { normalizeUrl } from '../../utils/url.js';
import { optionalImageRules, textRule } from '../../utils/validators.js';

/** Search Console gives a whole tag; keep only its `content` value. */
const verificationCode = (value) => {
  const text = String(value ?? '').trim();
  return text.match(/content\s*=\s*["']([^"']*)["']/i)?.[1]?.trim() ?? text;
};

/** PUT /api/admin/settings/general: `{ siteName, siteUrl, brandColor, contactEmail, footer: { copyright, backToTopLabel } }`. */
export const updateGeneralValidator = [
  textRule('siteName', SETTINGS_LIMITS.siteName, 'Site name', { required: true }),
  body('siteUrl')
    .isString()
    .withMessage('Site URL is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Site URL is required')
    .isLength({ max: SETTINGS_LIMITS.siteUrl })
    .withMessage(`Site URL can be up to ${SETTINGS_LIMITS.siteUrl} characters`)
    .customSanitizer((value) => siteOrigin(normalizeUrl(value)))
    .custom((value) => value.includes('.') || value.startsWith('http://localhost'))
    .withMessage('Site URL must be a valid address, e.g. https://yourname.com'),
  body('brandColor')
    .default(DEFAULT_BRAND_COLOR)
    .isString()
    .trim()
    .matches(HEX_COLOR)
    .withMessage('Brand color must be a hex color like #35d0ba')
    .toLowerCase(),
  body('contactEmail')
    .isString()
    .withMessage('Contact email is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Contact email is required')
    .isLength({ max: CONTACT_LIMITS.email })
    .withMessage(`Contact email can be up to ${CONTACT_LIMITS.email} characters`)
    .isEmail()
    .withMessage('Contact email must be a valid email address')
    .toLowerCase(),
  textRule('footer.copyright', SETTINGS_LIMITS.copyright, 'Copyright'),
  textRule('footer.backToTopLabel', SETTINGS_LIMITS.backToTop, 'Back to top label', { required: true }),
  validate,
];

/** PUT /api/admin/settings/seo: `{ title, description, image, googleVerification, favicon }`. */
export const updateSeoValidator = [
  textRule('title', SEO_LIMITS.title, 'SEO title', { required: true }),
  textRule('description', SEO_LIMITS.description, 'SEO description', { required: true }),
  ...optionalImageRules('image', 'Sharing image', SETTINGS_LIMITS.alt),
  body('googleVerification')
    .default('')
    .isString()
    .withMessage('Verification code must be text')
    .bail()
    .customSanitizer(verificationCode)
    .isLength({ max: SEO_LIMITS.verification })
    .withMessage(`Verification code can be up to ${SEO_LIMITS.verification} characters`)
    .custom((value) => !value || VERIFICATION_PATTERN.test(value))
    .withMessage('Paste the code from Google Search Console (letters, numbers, - and _)'),
  ...optionalImageRules('favicon', 'Favicon', SETTINGS_LIMITS.alt),
  validate,
];

/** PUT /api/admin/settings/coming-soon: what visitors see while the site is unpublished. */
export const updateComingSoonValidator = [
  textRule('badge', COMING_SOON_LIMITS.badge, 'Badge'),
  textRule('title.plain', COMING_SOON_LIMITS.title, 'Title', { required: true }),
  textRule('title.highlight', COMING_SOON_LIMITS.title, 'Highlighted words'),
  textRule('message', COMING_SOON_LIMITS.message, 'Message'),
  textRule('description', COMING_SOON_LIMITS.description, 'Small print'),
  ...optionalImageRules('image', 'Image', SETTINGS_LIMITS.alt),
  body('showEmail').isBoolean().withMessage('Show email must be true or false').toBoolean(),
  validate,
];

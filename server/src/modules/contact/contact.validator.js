import { body } from 'express-validator';
import { CONTACT_LIMITS, MAX_SOCIALS, PLATFORM_KEYS } from '../../../../shared/contact.js';
import { WHATSAPP_NUMBER } from '../../../../shared/identity.js';
import validate from '../../middleware/validate.js';
import { isHttpUrl, normalizeUrl } from '../../utils/url.js';
import { ctaRules, sectionHeadingRules } from '../../utils/validators.js';

/**
 * PUT /api/admin/contact: `{ contactEmail, whatsapp?, socials: [{ platform, url }], primaryCta, secondaryCta? }`. Socials are
 * in display order, one per platform. A missing / null `secondaryCta` removes the second button.
 */
export const saveContactValidator = [
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
  body('whatsapp')
    .default('')
    .isString()
    .trim()
    .custom((value) => !value || WHATSAPP_NUMBER.test(value))
    .withMessage('WhatsApp number must be in international format, e.g. +20 100 123 4567'),
  body('socials')
    .isArray({ max: MAX_SOCIALS })
    .withMessage(`Up to ${MAX_SOCIALS} social links`)
    .bail()
    .custom((socials) => {
      const platforms = socials.map((social) => social?.platform);
      if (new Set(platforms).size !== platforms.length) throw new Error('Each platform can be added once');
      return true;
    }),
  body('socials.*.platform').isIn(PLATFORM_KEYS).withMessage(`Platform must be one of: ${PLATFORM_KEYS.join(', ')}`),
  body('socials.*.url')
    .isString()
    .withMessage('Link is required')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Link is required')
    .isLength({ max: CONTACT_LIMITS.url })
    .withMessage(`Links can be up to ${CONTACT_LIMITS.url} characters`)
    .customSanitizer(normalizeUrl)
    .custom(isHttpUrl)
    .withMessage('Link must be a valid http(s) URL'),
  body('primaryCta').isObject().withMessage('The primary button is required'),
  ...ctaRules('primaryCta'),
  ...ctaRules('secondaryCta'),
  validate,
];

export const updateContactSectionValidator = [...sectionHeadingRules(), validate];

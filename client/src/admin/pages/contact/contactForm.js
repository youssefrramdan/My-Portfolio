import { z } from 'zod';
import { CONTACT_LIMITS as LIMITS, EMAIL_PATTERN, MAX_SOCIALS, PLATFORM_KEYS } from '@shared/contact';
import { WHATSAPP_NUMBER } from '@shared/identity';
import { ctaSchema, emptyCta } from '../../lib/cta';
import { isUrlLike, tooLong } from '../../lib/contentItems';
import { CONTACT } from './constants';

let nextKey = 0;
/** `key` keeps each row stable while it is dragged or removed. */
export const newSocial = (platform, url = '') => ({ key: `social-${(nextKey += 1)}`, platform, url });

const COPY = CONTACT;

const social = z.object({
  key: z.string(),
  platform: z.enum(PLATFORM_KEYS),
  url: z
    .string()
    .trim()
    .min(1, COPY.socials.urlRequired)
    .max(LIMITS.url, tooLong(LIMITS.url))
    .refine(isUrlLike, COPY.socials.urlInvalid),
});

/** Client copy of `saveContactValidator`. The secondary button is optional, but once it has a label it needs a target. */
export const contactSchema = z
  .object({
    contactEmail: z
      .string()
      .trim()
      .min(1, COPY.email.required)
      .max(LIMITS.email, tooLong(LIMITS.email))
      .regex(EMAIL_PATTERN, COPY.email.invalid),
    whatsapp: z
      .string()
      .trim()
      .refine((value) => !value || WHATSAPP_NUMBER.test(value), COPY.whatsapp.invalid),
    socials: z.array(social).max(MAX_SOCIALS, COPY.socials.full),
    primaryCta: ctaSchema({ required: true }),
    secondaryCta: ctaSchema(),
  })
  .superRefine(({ socials, secondaryCta }, context) => {
    const seen = new Set();
    socials.forEach(({ platform }, position) => {
      if (seen.has(platform)) context.addIssue({ code: 'custom', path: ['socials', position, 'platform'], message: COPY.socials.duplicate });
      seen.add(platform);
    });
    const { label, action, target } = secondaryCta;
    if (label.trim() && (action === 'scroll' || action === 'link') && !target.trim()) {
      context.addIssue({ code: 'custom', path: ['secondaryCta', 'target'], message: COPY.ctas.targetRequired });
    }
  });

const toCta = (cta) => ({ ...emptyCta(), ...cta, target: cta?.target ?? '' });

export const toForm = (state) => ({
  contactEmail: state.contactEmail ?? '',
  whatsapp: state.whatsapp ?? '',
  socials: (state.socials ?? []).map(({ platform, url }) => newSocial(platform, url)),
  primaryCta: toCta(state.section?.primaryCta),
  secondaryCta: toCta(state.section?.secondaryCta),
});

const ctaPayload = ({ label, action, target }) => ({ label: label.trim(), action, target: target.trim() });

export const toPayload = ({ contactEmail, whatsapp, socials, primaryCta, secondaryCta }) => ({
  contactEmail: contactEmail.trim(),
  whatsapp: whatsapp.trim(),
  socials: socials.map(({ platform, url }) => ({ platform, url: url.trim() })),
  primaryCta: ctaPayload(primaryCta),
  secondaryCta: secondaryCta.label.trim() ? ctaPayload(secondaryCta) : null,
});

import { z } from 'zod';
import { TESTIMONIAL_LIMITS as LIMITS } from '@shared/testimonials';
import { tooLong } from '../../lib/contentItems';

const text = (max) => z.string().max(max, tooLong(max));

/** Client copy of the server draft rules (`testimonials.validator.js`); emptiness is checked on publish. */
export const testimonialSchema = z.object({
  name: text(LIMITS.name),
  role: text(LIMITS.role),
  avatar: z.object({ url: z.string(), publicId: z.string(), alt: text(LIMITS.alt) }),
  message: text(LIMITS.message),
});

export const toForm = (content = {}) => ({
  name: content.name ?? '',
  role: content.role ?? '',
  avatar: { url: content.avatar?.url ?? '', publicId: content.avatar?.publicId ?? '', alt: content.avatar?.alt ?? '' },
  message: content.message ?? '',
});

export const toPayload = (values) => values;

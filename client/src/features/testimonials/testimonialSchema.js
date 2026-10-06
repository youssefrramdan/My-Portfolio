import { z } from 'zod';
import { TESTIMONIAL_HONEYPOT, TESTIMONIAL_LIMITS } from '@shared/testimonials';
import { TESTIMONIAL_ERRORS, TESTIMONIAL_FORM } from './labels';

export { TESTIMONIAL_HONEYPOT, TESTIMONIAL_LIMITS };

const text = (field) => {
  const { errorName } = TESTIMONIAL_FORM.fields[field];
  const max = TESTIMONIAL_LIMITS[field];
  return z
    .string()
    .trim()
    .min(1, TESTIMONIAL_ERRORS.required(errorName))
    .max(max, TESTIMONIAL_ERRORS.tooLong(errorName, max));
};

/** Same rules and limits as the server validator (`shared/testimonials.js`). */
export const testimonialSchema = z.object({
  name: text('name'),
  role: text('role'),
  message: text('message'),
  [TESTIMONIAL_HONEYPOT]: z.string(),
});

export const EMPTY_TESTIMONIAL = { name: '', role: '', message: '', [TESTIMONIAL_HONEYPOT]: '' };

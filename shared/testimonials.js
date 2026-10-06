import { filled } from './content.js';

/**
 * Testimonial limits, read by the server validator and model and by the client form schemas (public form and
 * dashboard). Change them here only.
 */
export const TESTIMONIAL_LIMITS = {
  name: 60,
  role: 80,
  message: 500,
  alt: 150,
};

/** "What People Say" heading extras in the Testimonials "Main Details". */
export const TESTIMONIALS_SECTION_LIMITS = {
  ctaHeading: 60,
  ctaDescription: 200,
  ctaButtonLabel: 30,
};

/** Hidden anti-spam field: real visitors never fill it, bots usually do. */
export const TESTIMONIAL_HONEYPOT = 'website';

/**
 * `pending` = sent from the public form and waiting for review; `draft` = hidden; only `published` testimonials are
 * public. Approving a pending one publishes it.
 */
export const TESTIMONIAL_STATUS = ['pending', 'draft', 'published'];

/** `visitor` = sent from the public form, `admin` = added by the site owner (seed / dashboard). */
export const TESTIMONIAL_SOURCE = ['visitor', 'admin'];

/** What blocks publishing a testimonial (`[{ field, message }]`). */
export function testimonialPublishProblems(testimonial = {}) {
  const problems = [];
  if (!filled(testimonial.name)) problems.push({ field: 'name', message: 'Add a name' });
  if (!filled(testimonial.role)) problems.push({ field: 'role', message: 'Add a role' });
  if (!filled(testimonial.message)) problems.push({ field: 'message', message: 'Add the quote' });
  return problems;
}

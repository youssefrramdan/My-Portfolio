import { body, param } from 'express-validator';
import validate from '../../middleware/validate.js';
import { TESTIMONIAL_HONEYPOT, TESTIMONIAL_LIMITS, TESTIMONIALS_SECTION_LIMITS as SECTION } from '../../../../shared/testimonials.js';
import { optionalImageRules, sectionHeadingRules, textRule } from '../../utils/validators.js';

const text = (field, label) =>
  body(field)
    .isString()
    .withMessage(`${label} is required`)
    .trim()
    .notEmpty()
    .withMessage(`${label} is required`)
    .isLength({ max: TESTIMONIAL_LIMITS[field] })
    .withMessage(`${label} must be ${TESTIMONIAL_LIMITS[field]} characters or less`);

/** Public form. The honeypot is accepted here and checked in the controller, so bots get no hint. */
export const submitTestimonialValidator = [
  text('name', 'Name'),
  text('role', 'Job title'),
  text('message', 'Comment'),
  body(TESTIMONIAL_HONEYPOT).optional().isString(),
  validate,
];

export const testimonialIdValidator = [param('id').isMongoId().withMessage('Invalid testimonial id'), validate];

/** PUT /api/admin/testimonials/:id: the whole draft. Formats and limits are checked; emptiness is checked on publish. */
export const saveTestimonialValidator = [
  param('id').isMongoId().withMessage('Invalid testimonial id'),
  textRule('name', TESTIMONIAL_LIMITS.name, 'Name'),
  textRule('role', TESTIMONIAL_LIMITS.role, 'Role'),
  ...optionalImageRules('avatar', 'Avatar', TESTIMONIAL_LIMITS.alt),
  textRule('message', TESTIMONIAL_LIMITS.message, 'Quote'),
  validate,
];

export const updateTestimonialsSectionValidator = [
  ...sectionHeadingRules(),
  textRule('ctaHeading', SECTION.ctaHeading, 'Invite heading'),
  textRule('ctaDescription', SECTION.ctaDescription, 'Invite text'),
  textRule('ctaButtonLabel', SECTION.ctaButtonLabel, 'Button label', { required: true }),
  validate,
];

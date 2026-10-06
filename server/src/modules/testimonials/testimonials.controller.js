import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import logger from '../../config/logger.js';
import { TESTIMONIAL_HONEYPOT } from '../../../../shared/testimonials.js';
import {
  createTestimonial,
  deleteTestimonial,
  discardTestimonialDraft,
  getTestimonial,
  getTestimonialsSection,
  listTestimonials,
  publishedTestimonials,
  publishTestimonial,
  saveTestimonialDraft,
  submitVisitorTestimonial,
  unpublishTestimonial,
  updateTestimonialsSection,
} from './testimonials.service.js';

const SUBMITTED_MESSAGE = 'Thanks! Your testimonial will appear after review.';

/** GET /api/testimonials: the section copy + published testimonials, by `order` then newest first. */
export const getTestimonials = asyncHandler(async (req, res) => {
  const [section, testimonials] = await Promise.all([getTestimonialsSection(), publishedTestimonials()]);
  sendSuccess(res, { section, testimonials });
});

/**
 * POST /api/testimonials: always saved as a `pending` visitor testimonial; any status / source / order in
 * the body is ignored. A filled honeypot gets the same success response without saving anything, so bots
 * cannot tell they were caught.
 */
export const submitTestimonial = asyncHandler(async (req, res) => {
  if (req.body[TESTIMONIAL_HONEYPOT]) {
    logger.warn('Testimonial honeypot filled, submission dropped', { ip: req.ip });
    return sendSuccess(res, null, SUBMITTED_MESSAGE, 201);
  }

  await submitVisitorTestimonial(req.body);
  sendSuccess(res, null, SUBMITTED_MESSAGE, 201);
});

/** GET /api/admin/testimonials: every testimonial with its status and source, pending ones first. */
export const listTestimonialItems = asyncHandler(async (req, res) => {
  sendSuccess(res, await listTestimonials());
});

/** GET /api/admin/testimonials/:id */
export const getTestimonialItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await getTestimonial(req.params.id));
});

/** POST /api/admin/testimonials: a new empty draft written by the admin. */
export const createTestimonialItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await createTestimonial(), 'Testimonial created', 201);
});

/** PUT /api/admin/testimonials/:id: saves the whole draft (the site changes only when it is published). */
export const saveTestimonialItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await saveTestimonialDraft(req.params.id, req.body), 'Draft saved');
});

/** POST /api/admin/testimonials/:id/publish: also approves a pending one. */
export const publishTestimonialItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await publishTestimonial(req.params.id), 'Testimonial published');
});

/** POST /api/admin/testimonials/:id/unpublish */
export const unpublishTestimonialItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await unpublishTestimonial(req.params.id), 'Testimonial moved to draft');
});

/** POST /api/admin/testimonials/:id/discard */
export const discardTestimonialItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await discardTestimonialDraft(req.params.id), 'Draft discarded');
});

/** DELETE /api/admin/testimonials/:id: also rejects a pending one. */
export const deleteTestimonialItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await deleteTestimonial(req.params.id), 'Testimonial deleted');
});

/** GET /api/admin/testimonials/section */
export const getSection = asyncHandler(async (req, res) => {
  sendSuccess(res, await getTestimonialsSection());
});

/** PUT /api/admin/testimonials/section */
export const updateSection = asyncHandler(async (req, res) => {
  sendSuccess(res, await updateTestimonialsSection(req.body), 'Section saved');
});

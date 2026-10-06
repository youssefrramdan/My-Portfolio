import { Router } from 'express';
import { testimonialLimiter } from '../../middleware/rateLimit.js';
import { getTestimonials, submitTestimonial } from './testimonials.controller.js';
import { submitTestimonialValidator } from './testimonials.validator.js';

const router = Router();

router.get('/', getTestimonials);
router.post('/', testimonialLimiter, submitTestimonialValidator, submitTestimonial);

export default router;

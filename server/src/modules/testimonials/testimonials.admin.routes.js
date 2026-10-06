import { Router } from 'express';
import {
  createTestimonialItem,
  deleteTestimonialItem,
  discardTestimonialItem,
  getSection,
  getTestimonialItem,
  listTestimonialItems,
  publishTestimonialItem,
  saveTestimonialItem,
  unpublishTestimonialItem,
  updateSection,
} from './testimonials.controller.js';
import { saveTestimonialValidator, testimonialIdValidator, updateTestimonialsSectionValidator } from './testimonials.validator.js';

const router = Router();

router.get('/section', getSection);
router.put('/section', updateTestimonialsSectionValidator, updateSection);

router.get('/', listTestimonialItems);
router.post('/', createTestimonialItem);
router.get('/:id', testimonialIdValidator, getTestimonialItem);
router.put('/:id', saveTestimonialValidator, saveTestimonialItem);
router.delete('/:id', testimonialIdValidator, deleteTestimonialItem);
router.post('/:id/publish', testimonialIdValidator, publishTestimonialItem);
router.post('/:id/unpublish', testimonialIdValidator, unpublishTestimonialItem);
router.post('/:id/discard', testimonialIdValidator, discardTestimonialItem);

export default router;

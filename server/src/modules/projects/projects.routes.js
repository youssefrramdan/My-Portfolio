import { Router } from 'express';
import { getProjectBySlug, getProjects } from './projects.controller.js';
import { projectSlugValidator } from './projects.validator.js';

const router = Router();

router.get('/', getProjects);
router.get('/:slug', projectSlugValidator, getProjectBySlug);

export default router;

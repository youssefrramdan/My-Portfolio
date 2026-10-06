import { Router } from 'express';
import { getAdminSettings, updateComingSoon, updateGeneral, updateSeo } from './settings.controller.js';
import { updateComingSoonValidator, updateGeneralValidator, updateSeoValidator } from './settings.validator.js';

const router = Router();

router.get('/', getAdminSettings);
router.put('/general', updateGeneralValidator, updateGeneral);
router.put('/seo', updateSeoValidator, updateSeo);
router.put('/coming-soon', updateComingSoonValidator, updateComingSoon);

export default router;

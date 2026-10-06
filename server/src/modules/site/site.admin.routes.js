import { Router } from 'express';
import { publishSite, unpublishSite } from './site.controller.js';

const router = Router();

router.post('/publish', publishSite);
router.post('/unpublish', unpublishSite);

export default router;

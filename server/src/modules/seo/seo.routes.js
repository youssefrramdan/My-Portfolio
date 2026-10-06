import { Router } from 'express';
import { getSeo, robots, sitemap } from './seo.controller.js';

const router = Router();

router.get('/', getSeo);
router.get('/sitemap.xml', sitemap);
router.get('/robots.txt', robots);

export default router;

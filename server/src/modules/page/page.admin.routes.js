import { Router } from 'express';
import { getAdminPage, updatePage } from './page.controller.js';
import { updatePageValidator } from './page.validator.js';

const router = Router();

router.get('/', getAdminPage);
router.put('/', updatePageValidator, updatePage);

export default router;

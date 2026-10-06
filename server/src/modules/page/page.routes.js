import { Router } from 'express';
import { getPage } from './page.controller.js';

const router = Router();

router.get('/', getPage);

export default router;

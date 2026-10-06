import { Router } from 'express';
import { getOverview } from './overview.controller.js';

const router = Router();

router.get('/', getOverview);

export default router;

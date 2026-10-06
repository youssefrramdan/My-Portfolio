import { Router } from 'express';
import optionalAuth from '../../middleware/optionalAuth.js';
import { getSiteStatus } from './site.controller.js';

const router = Router();

router.get('/', optionalAuth, getSiteStatus);

export default router;

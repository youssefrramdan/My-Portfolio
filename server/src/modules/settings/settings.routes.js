import { Router } from 'express';
import { getSettings } from './settings.controller.js';

const router = Router();

router.get('/', getSettings);

// Edited from the dashboard: Settings pages (/api/admin/settings) and the Contact page (/api/admin/contact).

export default router;

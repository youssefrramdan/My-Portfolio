import { Router } from 'express';
import { getHero } from './hero.controller.js';

const router = Router();

// Writes go through the Identity draft (`/api/admin/identity`), never straight to the hero.
router.get('/', getHero);

export default router;

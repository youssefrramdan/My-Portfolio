import { Router } from 'express';
import { loginLimiter } from '../../middleware/rateLimit.js';
import requireAuth from '../../middleware/requireAuth.js';
import { login, logout, me } from './auth.controller.js';
import { loginValidator } from './auth.validator.js';

const router = Router();

router.post('/login', loginLimiter, loginValidator, login);
router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;

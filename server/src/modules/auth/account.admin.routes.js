import { Router } from 'express';
import { accountLimiter } from '../../middleware/rateLimit.js';
import { updateEmail, updatePassword, updateProfile } from './account.controller.js';
import { updateEmailValidator, updatePasswordValidator, updateProfileValidator } from './account.validator.js';

const router = Router();

router.put('/profile', updateProfileValidator, updateProfile);
router.put('/email', accountLimiter, updateEmailValidator, updateEmail);
router.put('/password', accountLimiter, updatePasswordValidator, updatePassword);

export default router;

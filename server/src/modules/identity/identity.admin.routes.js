import { Router } from 'express';
import { discardIdentity, getIdentity, publishIdentity, saveIdentity } from './identity.controller.js';
import { saveIdentityValidator } from './identity.validator.js';

const router = Router();

router.get('/', getIdentity);
router.put('/', saveIdentityValidator, saveIdentity);
router.post('/publish', publishIdentity);
router.post('/discard', discardIdentity);

export default router;

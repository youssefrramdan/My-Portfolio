import { Router } from 'express';
import { getAdminContact, updateAdminContact, updateSection } from './contact.controller.js';
import { saveContactValidator, updateContactSectionValidator } from './contact.validator.js';

const router = Router();

router.get('/', getAdminContact);
router.put('/', saveContactValidator, updateAdminContact);
router.put('/section', updateContactSectionValidator, updateSection);

export default router;

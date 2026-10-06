import { Router } from 'express';
import { getContact } from './contact.controller.js';

const router = Router();

router.get('/', getContact);

export default router;

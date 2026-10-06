import { Router } from 'express';
import { getEducation } from './education.controller.js';

const router = Router();

router.get('/', getEducation);

export default router;

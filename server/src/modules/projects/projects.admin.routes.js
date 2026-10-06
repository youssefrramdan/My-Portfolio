import { Router } from 'express';
import {
  createWorkItem,
  deleteWorkItem,
  discardWorkItem,
  getSection,
  getWorkItem,
  listWorkItems,
  publishWorkItem,
  reorderWorkItems,
  saveWorkItem,
  unpublishWorkItem,
  updateSection,
} from './projects.controller.js';
import {
  reorderWorkValidator,
  saveWorkValidator,
  updateProjectsSectionValidator,
  workIdValidator,
} from './projects.validator.js';

const router = Router();

router.get('/section', getSection);
router.put('/section', updateProjectsSectionValidator, updateSection);
router.put('/order', reorderWorkValidator, reorderWorkItems);

router.get('/', listWorkItems);
router.post('/', createWorkItem);
router.get('/:id', workIdValidator, getWorkItem);
router.put('/:id', saveWorkValidator, saveWorkItem);
router.delete('/:id', workIdValidator, deleteWorkItem);
router.post('/:id/publish', workIdValidator, publishWorkItem);
router.post('/:id/unpublish', workIdValidator, unpublishWorkItem);
router.post('/:id/discard', workIdValidator, discardWorkItem);

export default router;

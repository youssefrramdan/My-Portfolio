import { Router } from 'express';
import {
  createSkillGroup,
  deleteSkillGroup,
  discardSkillGroup,
  getSection,
  getSkillGroup,
  listSkillGroups,
  publishSkillGroup,
  reorderSkillGroups,
  saveSkillGroup,
  unpublishSkillGroup,
  updateSection,
} from './skills.controller.js';
import { groupIdValidator, reorderGroupsValidator, saveGroupValidator, updateSkillsSectionValidator } from './skills.validator.js';

const router = Router();

router.get('/section', getSection);
router.put('/section', updateSkillsSectionValidator, updateSection);
router.put('/order', reorderGroupsValidator, reorderSkillGroups);

router.get('/', listSkillGroups);
router.post('/', createSkillGroup);
router.get('/:id', groupIdValidator, getSkillGroup);
router.put('/:id', saveGroupValidator, saveSkillGroup);
router.delete('/:id', groupIdValidator, deleteSkillGroup);
router.post('/:id/publish', groupIdValidator, publishSkillGroup);
router.post('/:id/unpublish', groupIdValidator, unpublishSkillGroup);
router.post('/:id/discard', groupIdValidator, discardSkillGroup);

export default router;

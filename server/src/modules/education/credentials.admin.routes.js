import { Router } from 'express';
import {
  createCredentialItem,
  deleteCredentialItem,
  discardCredentialItem,
  getCredentialItem,
  getSection,
  listCredentialItems,
  publishCredentialItem,
  reorderCredentialItems,
  saveCredentialItem,
  unpublishCredentialItem,
  updateSection,
} from './education.controller.js';
import {
  credentialIdValidator,
  reorderCredentialsValidator,
  saveCredentialValidator,
  updateEducationSectionValidator,
} from './education.validator.js';

const router = Router();

router.get('/section', getSection);
router.put('/section', updateEducationSectionValidator, updateSection);
router.put('/order', reorderCredentialsValidator, reorderCredentialItems);

router.get('/', listCredentialItems);
router.post('/', createCredentialItem);
router.get('/:id', credentialIdValidator, getCredentialItem);
router.put('/:id', saveCredentialValidator, saveCredentialItem);
router.delete('/:id', credentialIdValidator, deleteCredentialItem);
router.post('/:id/publish', credentialIdValidator, publishCredentialItem);
router.post('/:id/unpublish', credentialIdValidator, unpublishCredentialItem);
router.post('/:id/discard', credentialIdValidator, discardCredentialItem);

export default router;

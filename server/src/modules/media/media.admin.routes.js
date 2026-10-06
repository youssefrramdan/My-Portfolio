import { Router } from 'express';
import {
  createFolder,
  deleteFolder,
  deleteMedia,
  listFolders,
  listMedia,
  moveMedia,
  signUpload,
  updateFolder,
  uploadMedia,
} from './media.controller.js';
import {
  createFolderValidator,
  deleteMediaValidator,
  folderIdValidator,
  listFoldersValidator,
  listMediaValidator,
  moveMediaValidator,
  signUploadValidator,
  updateFolderValidator,
  uploadMediaValidator,
} from './media.validator.js';

const router = Router();

router.get('/folders', listFoldersValidator, listFolders);
router.post('/folders', createFolderValidator, createFolder);
router.patch('/folders/:id', updateFolderValidator, updateFolder);
router.delete('/folders/:id', folderIdValidator, deleteFolder);
router.put('/move', moveMediaValidator, moveMedia);

router.get('/', listMediaValidator, listMedia);
router.post('/sign', signUploadValidator, signUpload);
router.post('/', uploadMediaValidator, uploadMedia);
router.delete('/', deleteMediaValidator, deleteMedia);

export default router;

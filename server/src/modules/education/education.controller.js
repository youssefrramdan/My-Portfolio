import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import {
  createCredential,
  deleteCredential,
  discardCredentialDraft,
  getCredential,
  getEducationSection,
  listCredentials,
  publishCredential,
  publishedEducation,
  reorderCredentials,
  saveCredentialDraft,
  unpublishCredential,
  updateEducationSection,
} from './education.service.js';

/** GET /api/education: heading + `educations` (degree / diploma cards) + the other published credentials, in display order. */
export const getEducation = asyncHandler(async (req, res) => {
  const [section, content] = await Promise.all([getEducationSection(), publishedEducation()]);
  sendSuccess(res, { section, ...content });
});

/** GET /api/admin/credentials: every credential (drafts included) with its working copy, in display order. */
export const listCredentialItems = asyncHandler(async (req, res) => {
  sendSuccess(res, await listCredentials());
});

/** GET /api/admin/credentials/:id */
export const getCredentialItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await getCredential(req.params.id));
});

/** POST /api/admin/credentials: a new empty draft credential. */
export const createCredentialItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await createCredential(), 'Credential created', 201);
});

/** PUT /api/admin/credentials/:id: saves the whole draft (the site changes only when it is published). */
export const saveCredentialItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await saveCredentialDraft(req.params.id, req.body), 'Draft saved');
});

/** POST /api/admin/credentials/:id/publish: 400 with `[{ field, message }]` when required details are missing. */
export const publishCredentialItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await publishCredential(req.params.id), 'Credential published');
});

/** POST /api/admin/credentials/:id/unpublish */
export const unpublishCredentialItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await unpublishCredential(req.params.id), 'Credential hidden from the site');
});

/** POST /api/admin/credentials/:id/discard */
export const discardCredentialItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await discardCredentialDraft(req.params.id), 'Draft discarded');
});

/** DELETE /api/admin/credentials/:id */
export const deleteCredentialItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await deleteCredential(req.params.id), 'Credential deleted');
});

/** PUT /api/admin/credentials/order: `{ ids }` = every credential id in the new order. */
export const reorderCredentialItems = asyncHandler(async (req, res) => {
  sendSuccess(res, await reorderCredentials(req.body.ids), 'Order saved');
});

/** GET /api/admin/credentials/section */
export const getSection = asyncHandler(async (req, res) => {
  sendSuccess(res, await getEducationSection());
});

/** PUT /api/admin/credentials/section */
export const updateSection = asyncHandler(async (req, res) => {
  sendSuccess(res, await updateEducationSection(req.body), 'Section saved');
});

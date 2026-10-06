import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { discardDraft, getIdentityState, publishDraft, saveDraft } from './identity.service.js';

/** GET /api/admin/identity: `{ identity, changes, hasDraft, draftSavedAt, contactEmail, sections }`. */
export const getIdentity = asyncHandler(async (req, res) => {
  sendSuccess(res, await getIdentityState());
});

/** PUT /api/admin/identity: saves the whole draft (nothing on the site changes until it is published). */
export const saveIdentity = asyncHandler(async (req, res) => {
  sendSuccess(res, await saveDraft(req.body), 'Draft saved');
});

/** POST /api/admin/identity/publish: 400 with `[{ field, message }]` when required details are missing. */
export const publishIdentity = asyncHandler(async (req, res) => {
  sendSuccess(res, await publishDraft(), 'Identity published');
});

/** POST /api/admin/identity/discard */
export const discardIdentity = asyncHandler(async (req, res) => {
  sendSuccess(res, await discardDraft(), 'Draft discarded');
});

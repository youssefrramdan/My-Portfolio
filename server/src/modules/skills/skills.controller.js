import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import {
  createGroup,
  deleteGroup,
  discardGroupDraft,
  getGroup,
  getSkillsSection,
  listGroups,
  publishedGroups,
  publishGroup,
  reorderGroups,
  saveGroupDraft,
  unpublishGroup,
  updateSkillsSection,
} from './skills.service.js';

/** GET /api/skills: heading + the published groups in display order (what the public site needs). */
export const getSkills = asyncHandler(async (req, res) => {
  const [section, categories] = await Promise.all([getSkillsSection(), publishedGroups()]);
  sendSuccess(res, { section, categories });
});

/** GET /api/admin/skills: every group (drafts included) with its working copy, in display order. */
export const listSkillGroups = asyncHandler(async (req, res) => {
  sendSuccess(res, await listGroups());
});

/** GET /api/admin/skills/:id: `{ _id, status, isLive, wasPublished, content, changes, hasDraft, ... }`. */
export const getSkillGroup = asyncHandler(async (req, res) => {
  sendSuccess(res, await getGroup(req.params.id));
});

/** POST /api/admin/skills: a new empty draft group. */
export const createSkillGroup = asyncHandler(async (req, res) => {
  sendSuccess(res, await createGroup(), 'Group created', 201);
});

/** PUT /api/admin/skills/:id: saves the whole draft (the site changes only when it is published). */
export const saveSkillGroup = asyncHandler(async (req, res) => {
  sendSuccess(res, await saveGroupDraft(req.params.id, req.body), 'Draft saved');
});

/** POST /api/admin/skills/:id/publish: 400 with `[{ field, message }]` when details are missing or slots are full. */
export const publishSkillGroup = asyncHandler(async (req, res) => {
  sendSuccess(res, await publishGroup(req.params.id), 'Group published');
});

/** POST /api/admin/skills/:id/unpublish */
export const unpublishSkillGroup = asyncHandler(async (req, res) => {
  sendSuccess(res, await unpublishGroup(req.params.id), 'Group hidden from the site');
});

/** POST /api/admin/skills/:id/discard */
export const discardSkillGroup = asyncHandler(async (req, res) => {
  sendSuccess(res, await discardGroupDraft(req.params.id), 'Draft discarded');
});

/** DELETE /api/admin/skills/:id */
export const deleteSkillGroup = asyncHandler(async (req, res) => {
  sendSuccess(res, await deleteGroup(req.params.id), 'Group deleted');
});

/** PUT /api/admin/skills/order: `{ ids }` = every group id in the new order. */
export const reorderSkillGroups = asyncHandler(async (req, res) => {
  sendSuccess(res, await reorderGroups(req.body.ids), 'Order saved');
});

/** GET /api/admin/skills/section */
export const getSection = asyncHandler(async (req, res) => {
  sendSuccess(res, await getSkillsSection());
});

/** PUT /api/admin/skills/section */
export const updateSection = asyncHandler(async (req, res) => {
  sendSuccess(res, await updateSkillsSection(req.body), 'Section saved');
});

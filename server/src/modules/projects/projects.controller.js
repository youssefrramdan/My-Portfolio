import { DEFAULT_PAGE_BUTTONS } from '../../../../shared/work.js';
import ApiError from '../../utils/ApiError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import Project from './project.model.js';
import {
  createWork,
  deleteWork,
  discardWorkDraft,
  getProjectsSection,
  getWork,
  listWork,
  publishWork,
  reorderWork,
  saveWorkDraft,
  unpublishWork,
  updateProjectsSection as saveProjectsSection,
} from './projects.service.js';

const PUBLISHED = { status: 'published' };
const PROJECT_SORT = { order: 1, createdAt: 1 };
const CARD_FIELDS = 'slug title description coverImage year tags cardLabel';
const PAGE_FIELDS = `${CARD_FIELDS} role client externalLink linkLabel gallery`;

/** Public tag shape: `{ label }`. */
const withTagObjects = (project) => ({ ...project, tags: (project.tags ?? []).map((label) => ({ label })) });

/**
 * GET /api/projects: heading + the published featured items in display order (cards only).
 * `?scope=all` lists every published item (the "All projects" page).
 */
export const getProjects = asyncHandler(async (req, res) => {
  const filter = req.query.scope === 'all' ? PUBLISHED : { ...PUBLISHED, featured: true };
  const [section, projects] = await Promise.all([
    getProjectsSection(),
    Project.find(filter).sort(PROJECT_SORT).select(`${CARD_FIELDS} -_id`).lean(),
  ]);
  sendSuccess(res, { section, projects: projects.map(withTagObjects) });
});

/**
 * GET /api/projects/:slug: one published item with its gallery and the page buttons from the heading (404 when
 * missing or hidden).
 */
export const getProjectBySlug = asyncHandler(async (req, res) => {
  const [project, section] = await Promise.all([
    Project.findOne({ ...PUBLISHED, slug: req.params.slug }).select(`${PAGE_FIELDS} -_id`).lean(),
    getProjectsSection(),
  ]);
  if (!project) throw ApiError.notFound('Project not found');
  sendSuccess(res, { ...withTagObjects(project), pageButtons: section?.pageButtons ?? DEFAULT_PAGE_BUTTONS });
});

/** GET /api/admin/projects: every item (drafts included) with its working copy, in display order. */
export const listWorkItems = asyncHandler(async (req, res) => {
  sendSuccess(res, await listWork());
});

/** GET /api/admin/projects/:id: `{ _id, slug, status, isLive, wasPublished, work, changes, hasDraft, ... }`. */
export const getWorkItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await getWork(req.params.id));
});

/** POST /api/admin/projects: a new empty draft. */
export const createWorkItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await createWork(), 'Work item created', 201);
});

/** PUT /api/admin/projects/:id: saves the whole draft (the site changes only when it is published). */
export const saveWorkItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await saveWorkDraft(req.params.id, req.body), 'Draft saved');
});

/** POST /api/admin/projects/:id/publish: 400 with `[{ field, message }]` when required details are missing. */
export const publishWorkItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await publishWork(req.params.id), 'Work item published');
});

/** POST /api/admin/projects/:id/unpublish */
export const unpublishWorkItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await unpublishWork(req.params.id), 'Work item hidden from the site');
});

/** POST /api/admin/projects/:id/discard */
export const discardWorkItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await discardWorkDraft(req.params.id), 'Draft discarded');
});

/** DELETE /api/admin/projects/:id */
export const deleteWorkItem = asyncHandler(async (req, res) => {
  sendSuccess(res, await deleteWork(req.params.id), 'Work item deleted');
});

/** PUT /api/admin/projects/order: `{ ids }` = every item id in the new order. */
export const reorderWorkItems = asyncHandler(async (req, res) => {
  sendSuccess(res, await reorderWork(req.body.ids), 'Order saved');
});

/** GET /api/admin/projects/section */
export const getSection = asyncHandler(async (req, res) => {
  sendSuccess(res, await getProjectsSection());
});

/** PUT /api/admin/projects/section */
export const updateSection = asyncHandler(async (req, res) => {
  sendSuccess(res, await saveProjectsSection(req.body), 'Section saved');
});

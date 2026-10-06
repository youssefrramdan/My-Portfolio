import mongoose from 'mongoose';
import {
  DEFAULT_LINK_LABEL,
  DEFAULT_PAGE_BUTTONS,
  GALLERY_LAYOUTS,
  WORK_LINK_LABELS,
  workPublishProblems,
} from '../../../../shared/work.js';
import ApiError from '../../utils/ApiError.js';
import Project, { slugify } from './project.model.js';
import ProjectsSection from './projectsSection.model.js';

/** Content fields of a Work item, in the order the dashboard lists changes. */
export const WORK_KEYS = [
  'title',
  'description',
  'coverImage',
  'year',
  'role',
  'client',
  'externalLink',
  'linkLabel',
  'cardLabel',
  'featured',
  'tags',
  'gallery',
];

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const image = (value) => ({ url: text(value?.url), publicId: text(value?.publicId), alt: text(value?.alt) });
const year = (value) => (Number.isInteger(Number(value)) && value !== null && value !== '' ? Number(value) : null);

/** The dashboard shape with every field present and only known keys kept. */
export function normalizeWork(input = {}) {
  const tags = (input.tags ?? []).map(text).filter(Boolean);
  return {
    title: text(input.title),
    description: text(input.description),
    coverImage: image(input.coverImage),
    year: year(input.year),
    role: text(input.role),
    client: text(input.client),
    externalLink: text(input.externalLink),
    linkLabel: WORK_LINK_LABELS.includes(text(input.linkLabel)) ? text(input.linkLabel) : DEFAULT_LINK_LABEL,
    cardLabel: text(input.cardLabel),
    featured: input.featured !== false,
    tags: [...new Set(tags)],
    gallery: (input.gallery ?? [])
      .map((item) => ({ ...image(item), layout: GALLERY_LAYOUTS.includes(item?.layout) ? item.layout : 'full' }))
      .filter((item) => item.url),
  };
}

/** The live content of a project document in the dashboard shape. */
const toWork = (project) => normalizeWork(project);

/** What the editor works on: the draft when there is one, else the live content. */
const workingCopy = (project) => (project.draft ? normalizeWork(project.draft) : toWork(project));

const changedKeys = (work, live) => WORK_KEYS.filter((key) => JSON.stringify(work[key]) !== JSON.stringify(live[key]));

/**
 * Dashboard view of one item. `isLive` = visible on the site; `changes` = fields that differ from the live
 * version (empty for an item that was never published: all of it is new).
 */
function toAdminItem(project) {
  const work = workingCopy(project);
  const wasPublished = Boolean(project.publishedAt);
  return {
    _id: project._id,
    slug: project.slug ?? '',
    status: project.status,
    isLive: project.status === 'published',
    wasPublished,
    work,
    changes: wasPublished ? changedKeys(work, toWork(project)) : [],
    hasDraft: Boolean(project.draft),
    order: project.order,
    publishedAt: project.publishedAt,
    updatedAt: project.updatedAt,
  };
}

async function findProject(id) {
  const project = await Project.findById(id).lean();
  if (!project) throw ApiError.notFound('Work item not found');
  return project;
}

export async function listWork() {
  const projects = await Project.find().sort({ order: 1, createdAt: 1 }).lean();
  return projects.map(toAdminItem);
}

export async function getWork(id) {
  return toAdminItem(await findProject(id));
}

/** New empty item at the end of the list (a draft until it is published). */
export async function createWork() {
  const last = await Project.findOne().sort({ order: -1 }).select('order').lean();
  const project = await Project.create({ order: (last?.order ?? -1) + 1, draft: normalizeWork({}) });
  return toAdminItem(project.toObject());
}

/**
 * Saves the whole draft. For an item that is already live, a draft identical to the live content is removed
 * (nothing left to publish).
 */
export async function saveWorkDraft(id, input) {
  const project = await findProject(id);
  const work = normalizeWork(input);
  const keep = !project.publishedAt || changedKeys(work, toWork(project)).length > 0;
  const updated = await Project.findByIdAndUpdate(id, { draft: keep ? work : null }, { returnDocument: 'after' }).lean();
  return toAdminItem(updated);
}

/** First free slug for `title`: "gadora", then "gadora-2", "gadora-3", ... */
async function uniqueSlug(title, id) {
  const base = slugify(title) || 'work';
  for (let attempt = 1; ; attempt += 1) {
    const slug = attempt === 1 ? base : `${base}-${attempt}`;
    // `sanitizeFilter` is on globally, so our own operator has to be marked as trusted.
    const taken = await Project.exists({ slug, _id: mongoose.trusted({ $ne: id }) });
    if (!taken) return slug;
  }
}

/** Copies the working copy into the live fields and shows the item on the site. */
export async function publishWork(id) {
  const project = await findProject(id);
  const work = workingCopy(project);
  const problems = workPublishProblems(work);
  if (problems.length) {
    throw ApiError.badRequest('Fill in the missing details before publishing.', problems);
  }

  const updated = await Project.findByIdAndUpdate(
    id,
    {
      ...work,
      slug: project.slug || (await uniqueSlug(work.title, id)),
      status: 'published',
      draft: null,
      publishedAt: new Date(),
    },
    { returnDocument: 'after', runValidators: true },
  ).lean();
  return toAdminItem(updated);
}

/** Hides the item from the site; its content and any draft stay. */
export async function unpublishWork(id) {
  await findProject(id);
  const updated = await Project.findByIdAndUpdate(id, { status: 'draft' }, { returnDocument: 'after' }).lean();
  return toAdminItem(updated);
}

/** Drops the draft of an item that has a live version. */
export async function discardWorkDraft(id) {
  const project = await findProject(id);
  if (!project.publishedAt) throw ApiError.badRequest('This item has never been published, so there is nothing to go back to.');
  const updated = await Project.findByIdAndUpdate(id, { draft: null }, { returnDocument: 'after' }).lean();
  return toAdminItem(updated);
}

export async function deleteWork(id) {
  const project = await Project.findByIdAndDelete(id).lean();
  if (!project) throw ApiError.notFound('Work item not found');
  return { _id: project._id };
}

/** `ids` = every item id in the new display order. */
export async function reorderWork(ids) {
  const total = await Project.countDocuments();
  if (new Set(ids).size !== ids.length || ids.length !== total) {
    throw ApiError.badRequest('Send every work item exactly once to reorder them.');
  }
  const result = await Project.bulkWrite(
    ids.map((id, order) => ({
      updateOne: { filter: { _id: new mongoose.Types.ObjectId(id) }, update: { $set: { order } } },
    })),
  );
  if (result.matchedCount !== ids.length) throw ApiError.badRequest('Some work items no longer exist. Reload and try again.');
  return listWork();
}

const SECTION_FIELDS = '-__v -createdAt -updatedAt';

/** A heading saved before `pageButtons` existed gets the default buttons. */
const withPageButtons = (section) => section && { ...section, pageButtons: section.pageButtons ?? DEFAULT_PAGE_BUTTONS };

export const getProjectsSection = () => ProjectsSection.findOne().select(SECTION_FIELDS).lean().then(withPageButtons);

export const updateProjectsSection = (input) =>
  ProjectsSection.findOneAndUpdate({}, input, {
    upsert: true,
    returnDocument: 'after',
    runValidators: true,
    setDefaultsOnInsert: true,
  })
    .select(SECTION_FIELDS)
    .lean()
    .then(withPageButtons);

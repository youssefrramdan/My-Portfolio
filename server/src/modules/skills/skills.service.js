import mongoose from 'mongoose';
import { capabilityPublishProblems, MAX_PUBLISHED_GROUPS } from '../../../../shared/capabilities.js';
import { normalizeIcon } from '../../../../shared/icons.js';
import ApiError from '../../utils/ApiError.js';
import SkillCategory from './skillCategory.model.js';
import SkillsSection from './skillsSection.model.js';

/** Content fields of a group, in the order the dashboard lists changes. */
export const GROUP_KEYS = ['title', 'glyph', 'icon', 'items'];

const SINGLETON_UPDATE = { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true };
const GROUP_SORT = { order: 1, createdAt: 1 };

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const image = (value) => ({ url: text(value?.url), publicId: text(value?.publicId), alt: text(value?.alt) });

/** The dashboard shape with every field present and only known keys kept (empty items dropped). */
export function normalizeGroup(input = {}) {
  return {
    title: text(input.title),
    glyph: normalizeIcon(input.glyph?.name, input.glyph?.nodes),
    icon: image(input.icon),
    items: (input.items ?? []).map(text).filter(Boolean),
  };
}

/** What the editor works on: the draft when there is one, else the live content. */
const workingCopy = (group) => (group.draft ? normalizeGroup(group.draft) : normalizeGroup(group));

const changedKeys = (content, live) => GROUP_KEYS.filter((key) => JSON.stringify(content[key]) !== JSON.stringify(live[key]));

/** Dashboard view of one group (same bookkeeping as a Work item; `content` = the working copy). */
function toAdminItem(group) {
  const content = workingCopy(group);
  const wasPublished = Boolean(group.publishedAt);
  return {
    _id: group._id,
    status: group.status,
    isLive: group.status === 'published',
    wasPublished,
    content,
    changes: wasPublished ? changedKeys(content, normalizeGroup(group)) : [],
    hasDraft: Boolean(group.draft),
    order: group.order,
    publishedAt: group.publishedAt,
    updatedAt: group.updatedAt,
  };
}

async function findGroup(id) {
  const group = await SkillCategory.findById(id).lean();
  if (!group) throw ApiError.notFound('Capability group not found');
  return group;
}

export async function listGroups() {
  const groups = await SkillCategory.find().sort(GROUP_SORT).lean();
  return groups.map(toAdminItem);
}

export async function getGroup(id) {
  return toAdminItem(await findGroup(id));
}

/** New empty group at the end of the list (a draft until it is published). */
export async function createGroup() {
  const last = await SkillCategory.findOne().sort({ order: -1 }).select('order').lean();
  const group = await SkillCategory.create({ order: (last?.order ?? -1) + 1, draft: normalizeGroup({}) });
  return toAdminItem(group.toObject());
}

/** Saves the whole draft; for a live group, a draft identical to the live content is removed. */
export async function saveGroupDraft(id, input) {
  const group = await findGroup(id);
  const content = normalizeGroup(input);
  const keep = !group.publishedAt || changedKeys(content, normalizeGroup(group)).length > 0;
  const updated = await SkillCategory.findByIdAndUpdate(id, { draft: keep ? content : null }, { returnDocument: 'after' }).lean();
  return toAdminItem(updated);
}

/**
 * Copies the working copy into the live fields and shows the group on the site. A group that is not live yet is
 * refused when the four card slots are taken.
 */
export async function publishGroup(id) {
  const group = await findGroup(id);
  const content = workingCopy(group);
  const problems = capabilityPublishProblems(content);
  if (problems.length) throw ApiError.badRequest('Fill in the missing details before publishing.', problems);

  if (group.status !== 'published') {
    // `sanitizeFilter` is on globally, so our own operator has to be marked as trusted.
    const live = await SkillCategory.countDocuments({ status: 'published', _id: mongoose.trusted({ $ne: group._id }) });
    if (live >= MAX_PUBLISHED_GROUPS) {
      throw ApiError.badRequest(`Only ${MAX_PUBLISHED_GROUPS} groups can be live at once.`, [
        { field: 'limit', message: `Unpublish another group first: the section has ${MAX_PUBLISHED_GROUPS} card slots.` },
      ]);
    }
  }

  const updated = await SkillCategory.findByIdAndUpdate(
    id,
    { ...content, status: 'published', draft: null, publishedAt: new Date() },
    { returnDocument: 'after', runValidators: true },
  ).lean();
  return toAdminItem(updated);
}

/** Hides the group from the site; its content and any draft stay. */
export async function unpublishGroup(id) {
  await findGroup(id);
  const updated = await SkillCategory.findByIdAndUpdate(id, { status: 'draft' }, { returnDocument: 'after' }).lean();
  return toAdminItem(updated);
}

/** Drops the draft of a group that has a live version. */
export async function discardGroupDraft(id) {
  const group = await findGroup(id);
  if (!group.publishedAt) throw ApiError.badRequest('This group has never been published, so there is nothing to go back to.');
  const updated = await SkillCategory.findByIdAndUpdate(id, { draft: null }, { returnDocument: 'after' }).lean();
  return toAdminItem(updated);
}

export async function deleteGroup(id) {
  const group = await SkillCategory.findByIdAndDelete(id).lean();
  if (!group) throw ApiError.notFound('Capability group not found');
  return { _id: group._id };
}

/** `ids` = every group id in the new display order. */
export async function reorderGroups(ids) {
  const total = await SkillCategory.countDocuments();
  if (new Set(ids).size !== ids.length || ids.length !== total) {
    throw ApiError.badRequest('Send every group exactly once to reorder them.');
  }
  const result = await SkillCategory.bulkWrite(
    ids.map((id, order) => ({
      updateOne: { filter: { _id: new mongoose.Types.ObjectId(id) }, update: { $set: { order } } },
    })),
  );
  if (result.matchedCount !== ids.length) throw ApiError.badRequest('Some groups no longer exist. Reload and try again.');
  return listGroups();
}

const SECTION_FIELDS = '-__v -createdAt -updatedAt';

export const getSkillsSection = () => SkillsSection.findOne().select(SECTION_FIELDS).lean();

export const updateSkillsSection = ({ badge, title, description }) =>
  SkillsSection.findOneAndUpdate({}, { badge, title, description }, SINGLETON_UPDATE).select(SECTION_FIELDS).lean();

/** Live groups for the public section, in display order. */
export const publishedGroups = () =>
  SkillCategory.find({ status: 'published' }).sort(GROUP_SORT).select('title glyph icon items').lean();

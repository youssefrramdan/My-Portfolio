import mongoose from 'mongoose';
import { credentialPublishProblems, DEFAULT_EDUCATION_LABEL } from '../../../../shared/credentials.js';
import ApiError from '../../utils/ApiError.js';
import Credential from './credential.model.js';
import EducationSection from './educationSection.model.js';

/** Content fields of a credential, in the order the dashboard lists changes. */
export const CREDENTIAL_KEYS = ['title', 'kind', 'label', 'issuer', 'date', 'link', 'detail', 'subjects', 'image'];

const SINGLETON_UPDATE = { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true };
const CREDENTIAL_SORT = { order: 1, createdAt: 1 };

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const image = (value) => ({ url: text(value?.url), publicId: text(value?.publicId), alt: text(value?.alt) });

/** The dashboard shape with every field present and only known keys kept (empty subjects dropped). */
export function normalizeCredential(input = {}) {
  return {
    title: text(input.title),
    kind: text(input.kind) || 'certificate',
    issuer: text(input.issuer),
    date: text(input.date),
    link: text(input.link),
    detail: text(input.detail),
    subjects: (input.subjects ?? []).map(text).filter(Boolean),
    label: text(input.label),
    image: image(input.image),
  };
}

/** What the editor works on: the draft when there is one, else the live content. */
const workingCopy = (credential) =>
  credential.draft ? normalizeCredential(credential.draft) : normalizeCredential(credential);

const changedKeys = (content, live) =>
  CREDENTIAL_KEYS.filter((key) => JSON.stringify(content[key]) !== JSON.stringify(live[key]));

/** Dashboard view of one credential (same bookkeeping as a Work item; `content` = the working copy). */
function toAdminItem(credential) {
  const content = workingCopy(credential);
  const wasPublished = Boolean(credential.publishedAt);
  return {
    _id: credential._id,
    status: credential.status,
    isLive: credential.status === 'published',
    wasPublished,
    content,
    changes: wasPublished ? changedKeys(content, normalizeCredential(credential)) : [],
    hasDraft: Boolean(credential.draft),
    order: credential.order,
    publishedAt: credential.publishedAt,
    updatedAt: credential.updatedAt,
  };
}

async function findCredential(id) {
  const credential = await Credential.findById(id).lean();
  if (!credential) throw ApiError.notFound('Credential not found');
  return credential;
}

export async function listCredentials() {
  const credentials = await Credential.find().sort(CREDENTIAL_SORT).lean();
  return credentials.map(toAdminItem);
}

export async function getCredential(id) {
  return toAdminItem(await findCredential(id));
}

/** New empty credential at the end of the list (a draft until it is published). */
export async function createCredential() {
  const last = await Credential.findOne().sort({ order: -1 }).select('order').lean();
  const credential = await Credential.create({ order: (last?.order ?? -1) + 1, draft: normalizeCredential({}) });
  return toAdminItem(credential.toObject());
}

/** Saves the whole draft; for a live credential, a draft identical to the live content is removed. */
export async function saveCredentialDraft(id, input) {
  const credential = await findCredential(id);
  const content = normalizeCredential(input);
  const keep = !credential.publishedAt || changedKeys(content, normalizeCredential(credential)).length > 0;
  const updated = await Credential.findByIdAndUpdate(id, { draft: keep ? content : null }, { returnDocument: 'after' }).lean();
  return toAdminItem(updated);
}

/** Copies the working copy into the live fields and shows the credential on the site. */
export async function publishCredential(id) {
  const credential = await findCredential(id);
  const content = workingCopy(credential);
  const problems = credentialPublishProblems(content);
  if (problems.length) throw ApiError.badRequest('Fill in the missing details before publishing.', problems);

  const updated = await Credential.findByIdAndUpdate(
    id,
    { ...content, status: 'published', draft: null, publishedAt: new Date() },
    { returnDocument: 'after', runValidators: true },
  ).lean();
  return toAdminItem(updated);
}

/** Hides the credential from the site; its content and any draft stay. */
export async function unpublishCredential(id) {
  await findCredential(id);
  const updated = await Credential.findByIdAndUpdate(id, { status: 'draft' }, { returnDocument: 'after' }).lean();
  return toAdminItem(updated);
}

/** Drops the draft of a credential that has a live version. */
export async function discardCredentialDraft(id) {
  const credential = await findCredential(id);
  if (!credential.publishedAt) {
    throw ApiError.badRequest('This credential has never been published, so there is nothing to go back to.');
  }
  const updated = await Credential.findByIdAndUpdate(id, { draft: null }, { returnDocument: 'after' }).lean();
  return toAdminItem(updated);
}

export async function deleteCredential(id) {
  const credential = await Credential.findByIdAndDelete(id).lean();
  if (!credential) throw ApiError.notFound('Credential not found');
  return { _id: credential._id };
}

/** `ids` = every credential id in the new display order. */
export async function reorderCredentials(ids) {
  const total = await Credential.countDocuments();
  if (new Set(ids).size !== ids.length || ids.length !== total) {
    throw ApiError.badRequest('Send every credential exactly once to reorder them.');
  }
  const result = await Credential.bulkWrite(
    ids.map((id, order) => ({
      updateOne: { filter: { _id: new mongoose.Types.ObjectId(id) }, update: { $set: { order } } },
    })),
  );
  if (result.matchedCount !== ids.length) throw ApiError.badRequest('Some credentials no longer exist. Reload and try again.');
  return listCredentials();
}

const SECTION_FIELDS = '-__v -createdAt -updatedAt';

export const getEducationSection = () => EducationSection.findOne().select(SECTION_FIELDS).lean();

export const updateEducationSection = ({ badge, title, description, certificatesTitle }) =>
  EducationSection.findOneAndUpdate({}, { badge, title, description, certificatesTitle }, SINGLETON_UPDATE)
    .select(SECTION_FIELDS)
    .lean();

/**
 * Public content of the section: every published `education` credential is a row of big cards (`educations`, in
 * display order), every other published credential is a row of the certificates card.
 */
export async function publishedEducation() {
  const credentials = await Credential.find({ status: 'published' }).sort(CREDENTIAL_SORT).lean();
  const educations = credentials
    .filter((credential) => credential.kind === 'education')
    .map((degree) => ({
      _id: degree._id,
      label: degree.label || DEFAULT_EDUCATION_LABEL,
      degreeTitle: degree.title,
      institution: degree.issuer,
      subjects: (degree.subjects ?? []).map((label) => ({ label })),
      graduationYear: degree.date,
      graduationDescription: degree.detail,
      image: degree.image?.url ? image(degree.image) : null,
    }));
  const certificates = credentials
    .filter((credential) => credential.kind !== 'education')
    .map(({ _id, kind, title, issuer, detail, date, link }) => ({ _id, kind, title, issuer, detail, date, link }));
  return { educations, certificates };
}

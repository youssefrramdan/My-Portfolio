import { testimonialPublishProblems } from '../../../../shared/testimonials.js';
import ApiError from '../../utils/ApiError.js';
import Testimonial from './testimonial.model.js';
import TestimonialsSection from './testimonialsSection.model.js';

/** Content fields of a testimonial, in the order the dashboard lists changes. */
export const TESTIMONIAL_KEYS = ['name', 'role', 'avatar', 'message'];

const SINGLETON_UPDATE = { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true };
const TESTIMONIAL_SORT = { order: 1, createdAt: -1 };

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const image = (value) => ({ url: text(value?.url), publicId: text(value?.publicId), alt: text(value?.alt) });

/** The dashboard shape with every field present and only known keys kept. */
export function normalizeTestimonial(input = {}) {
  return {
    name: text(input.name),
    role: text(input.role),
    avatar: image(input.avatar),
    message: text(input.message),
  };
}

/** What the editor works on: the draft when there is one, else the live content. */
const workingCopy = (testimonial) =>
  testimonial.draft ? normalizeTestimonial(testimonial.draft) : normalizeTestimonial(testimonial);

const changedKeys = (content, live) =>
  TESTIMONIAL_KEYS.filter((key) => JSON.stringify(content[key]) !== JSON.stringify(live[key]));

/** Dashboard view of one testimonial (same bookkeeping as a Work item, plus `source`). */
function toAdminItem(testimonial) {
  const content = workingCopy(testimonial);
  const wasPublished = Boolean(testimonial.publishedAt);
  return {
    _id: testimonial._id,
    status: testimonial.status,
    source: testimonial.source,
    isLive: testimonial.status === 'published',
    wasPublished,
    content,
    changes: wasPublished ? changedKeys(content, normalizeTestimonial(testimonial)) : [],
    hasDraft: Boolean(testimonial.draft),
    order: testimonial.order,
    publishedAt: testimonial.publishedAt,
    createdAt: testimonial.createdAt,
    updatedAt: testimonial.updatedAt,
  };
}

async function findTestimonial(id) {
  const testimonial = await Testimonial.findById(id).lean();
  if (!testimonial) throw ApiError.notFound('Testimonial not found');
  return testimonial;
}

const nextOrder = async () => {
  const last = await Testimonial.findOne().sort({ order: -1 }).select('order').lean();
  return (last?.order ?? -1) + 1;
};

/** Every testimonial, the ones waiting for review first, then in display order. */
export async function listTestimonials() {
  const testimonials = await Testimonial.find().sort(TESTIMONIAL_SORT).lean();
  const pendingFirst = (item) => (item.status === 'pending' ? 0 : 1);
  return testimonials.sort((a, b) => pendingFirst(a) - pendingFirst(b)).map(toAdminItem);
}

export async function getTestimonial(id) {
  return toAdminItem(await findTestimonial(id));
}

/** New empty testimonial written by the admin (a draft until it is published). */
export async function createTestimonial() {
  const testimonial = await Testimonial.create({
    source: 'admin',
    status: 'draft',
    order: await nextOrder(),
    draft: normalizeTestimonial({}),
  });
  return toAdminItem(testimonial.toObject());
}

/** Public form: stored as a visitor testimonial waiting for review. */
export async function submitVisitorTestimonial({ name, role, message }) {
  await Testimonial.create({
    source: 'visitor',
    status: 'pending',
    order: await nextOrder(),
    draft: normalizeTestimonial({ name, role, message }),
  });
}

/** Saves the whole draft (a pending one stays pending); for a live testimonial, a draft equal to it is removed. */
export async function saveTestimonialDraft(id, input) {
  const testimonial = await findTestimonial(id);
  const content = normalizeTestimonial(input);
  const keep = !testimonial.publishedAt || changedKeys(content, normalizeTestimonial(testimonial)).length > 0;
  const updated = await Testimonial.findByIdAndUpdate(id, { draft: keep ? content : null }, { returnDocument: 'after' }).lean();
  return toAdminItem(updated);
}

/** Copies the working copy into the live fields and shows the card on the site (approves a pending one). */
export async function publishTestimonial(id) {
  const testimonial = await findTestimonial(id);
  const content = workingCopy(testimonial);
  const problems = testimonialPublishProblems(content);
  if (problems.length) throw ApiError.badRequest('Fill in the missing details before publishing.', problems);

  const updated = await Testimonial.findByIdAndUpdate(
    id,
    { ...content, status: 'published', draft: null, publishedAt: new Date() },
    { returnDocument: 'after', runValidators: true },
  ).lean();
  return toAdminItem(updated);
}

/** Hides the card from the site; its content and any draft stay. */
export async function unpublishTestimonial(id) {
  await findTestimonial(id);
  const updated = await Testimonial.findByIdAndUpdate(id, { status: 'draft' }, { returnDocument: 'after' }).lean();
  return toAdminItem(updated);
}

/** Drops the draft of a testimonial that has a live version. */
export async function discardTestimonialDraft(id) {
  const testimonial = await findTestimonial(id);
  if (!testimonial.publishedAt) {
    throw ApiError.badRequest('This testimonial has never been published, so there is nothing to go back to.');
  }
  const updated = await Testimonial.findByIdAndUpdate(id, { draft: null }, { returnDocument: 'after' }).lean();
  return toAdminItem(updated);
}

/** Also how a pending testimonial is rejected. */
export async function deleteTestimonial(id) {
  const testimonial = await Testimonial.findByIdAndDelete(id).lean();
  if (!testimonial) throw ApiError.notFound('Testimonial not found');
  return { _id: testimonial._id };
}

const SECTION_FIELDS = '-__v -createdAt -updatedAt';

export const getTestimonialsSection = () => TestimonialsSection.findOne().select(SECTION_FIELDS).lean();

export const updateTestimonialsSection = ({ badge, title, description, ctaHeading, ctaDescription, ctaButtonLabel }) =>
  TestimonialsSection.findOneAndUpdate(
    {},
    { badge, title, description, ctaHeading, ctaDescription, ctaButtonLabel },
    SINGLETON_UPDATE,
  )
    .select(SECTION_FIELDS)
    .lean();

/** Live cards for the public section. Whitelist: status, source, order and timestamps never leave the server. */
export const publishedTestimonials = () =>
  Testimonial.find({ status: 'published' }).sort(TESTIMONIAL_SORT).select('name role message avatar').lean();

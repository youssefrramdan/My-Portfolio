import { z } from 'zod';
import { DEFAULT_LINK_LABEL, GALLERY_LAYOUTS, WORK_LIMITS as LIMITS, WORK_LINK_LABELS } from '@shared/work';
import { WORK_EDITOR } from './constants';

const { validation: messages } = WORK_EDITOR;
const text = (max) => z.string().max(max, messages.tooLong(max));

const withProtocol = (value) => (/^[a-z][a-z\d+.-]*:\/\//i.test(value) ? value : `https://${value}`);

/** Same idea as the server's `normalizeUrl` + `isHttpUrl`: "gadora.com" is fine, "gadora" is not. */
function isUrlLike(value) {
  try {
    const { protocol, hostname } = new URL(withProtocol(value.trim()));
    return (protocol === 'http:' || protocol === 'https:') && hostname.includes('.');
  } catch {
    return false;
  }
}

const image = z.object({ url: z.string(), publicId: z.string(), alt: text(LIMITS.alt) });

/**
 * Client copy of the server draft rules (`projects.validator.js`). Empty required fields are allowed in a draft;
 * publishing checks them (`workPublishProblems`). `year` is edited as text.
 */
export const workSchema = z.object({
  title: text(LIMITS.title),
  description: text(LIMITS.description),
  coverImage: image,
  year: z.string().refine((value) => {
    if (!value.trim()) return true;
    const year = Number(value);
    return Number.isInteger(year) && year >= LIMITS.yearMin && year <= LIMITS.yearMax;
  }, messages.year),
  role: text(LIMITS.role),
  client: text(LIMITS.client),
  externalLink: z.string().refine((value) => !value.trim() || isUrlLike(value), messages.url),
  linkLabel: z.enum(WORK_LINK_LABELS),
  cardLabel: text(LIMITS.cardLabel),
  featured: z.boolean(),
  tags: z.array(text(LIMITS.tag)).max(LIMITS.tags),
  gallery: z.array(image.extend({ layout: z.enum(GALLERY_LAYOUTS) })).max(LIMITS.gallery),
});

const pickImage = (value) => ({ url: value?.url ?? '', publicId: value?.publicId ?? '', alt: value?.alt ?? '' });

/** Working copy from the API -> form values. */
export function toForm(work = {}) {
  return {
    title: work.title ?? '',
    description: work.description ?? '',
    coverImage: pickImage(work.coverImage),
    year: work.year ? String(work.year) : '',
    role: work.role ?? '',
    client: work.client ?? '',
    externalLink: work.externalLink ?? '',
    linkLabel: WORK_LINK_LABELS.includes(work.linkLabel) ? work.linkLabel : DEFAULT_LINK_LABEL,
    cardLabel: work.cardLabel ?? '',
    featured: work.featured ?? true,
    tags: work.tags ?? [],
    gallery: (work.gallery ?? []).map((item) => ({ ...pickImage(item), layout: item.layout ?? 'full' })),
  };
}

/** Form values -> the draft body for `PUT /api/admin/projects/:id` (and the preview). */
export function toPayload(values) {
  const year = values.year.trim();
  return { ...values, year: year ? Number(year) : null, externalLink: values.externalLink.trim() };
}

/** Working copy (API or `toPayload` shape) -> the public project shape that the site components render. */
export function toPublicProject(work) {
  return { ...work, year: work.year || null, tags: (work.tags ?? []).map((label) => ({ label })) };
}

/** Stable id of a gallery image (one image appears once per gallery). */
export const imageKey = (image) => image.publicId || image.url;

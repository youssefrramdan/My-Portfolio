import { body, param } from 'express-validator';
import {
  GALLERY_LAYOUTS,
  MAX_PAGE_BUTTONS,
  WORK_LIMITS as LIMITS,
  PROJECTS_SECTION_LIMITS as SECTION_LIMITS,
  WORK_LINK_LABELS,
} from '../../../../shared/work.js';
import validate from '../../middleware/validate.js';
import { isHttpUrl, normalizeUrl } from '../../utils/url.js';
import { ctaRules } from '../../utils/validators.js';
import { SLUG_PATTERN } from './project.model.js';

/** Optional text with a max length. Drafts may leave required fields empty; publishing checks them. */
const textRule = (field, max, label) =>
  body(field)
    .default('')
    .isString()
    .withMessage(`${label} must be text`)
    .bail()
    .trim()
    .isLength({ max })
    .withMessage(`${label} can be up to ${max} characters`);

const imageUrlRule = (field, label, { required = false } = {}) => {
  const chain = required ? body(field) : body(field).optional({ values: 'falsy' });
  return chain
    .isString()
    .trim()
    .isURL({ protocols: ['https', 'http'], require_protocol: true })
    .withMessage(`${label} must be a valid image URL`);
};

const imageMetaRules = (field, label) => [
  body(`${field}.publicId`).optional().isString().trim(),
  body(`${field}.alt`).optional().isString().trim().isLength({ max: LIMITS.alt }).withMessage(`${label} alt text can be up to ${LIMITS.alt} characters`),
];

export const projectSlugValidator = [
  param('slug').trim().matches(SLUG_PATTERN).withMessage('Invalid project slug'),
  validate,
];

export const workIdValidator = [param('id').isMongoId().withMessage('Invalid work item id'), validate];

/** PUT /api/admin/projects/:id: the whole draft. Formats and limits are checked; emptiness is checked on publish. */
export const saveWorkValidator = [
  param('id').isMongoId().withMessage('Invalid work item id'),
  textRule('title', LIMITS.title, 'Title'),
  textRule('description', LIMITS.description, 'Short summary'),
  imageUrlRule('coverImage.url', 'Cover image'),
  ...imageMetaRules('coverImage', 'Cover image'),
  body('year')
    .optional({ values: 'null' })
    .isInt({ min: LIMITS.yearMin, max: LIMITS.yearMax })
    .withMessage(`Year must be between ${LIMITS.yearMin} and ${LIMITS.yearMax}`)
    .toInt(),
  textRule('role', LIMITS.role, 'Role / contribution'),
  textRule('client', LIMITS.client, 'Client / organization'),
  body('externalLink')
    .default('')
    .isString()
    .trim()
    .customSanitizer(normalizeUrl)
    .custom((value) => !value || isHttpUrl(value))
    .withMessage('External link must be a valid URL, e.g. https://example.com'),
  body('linkLabel')
    .optional({ values: 'falsy' })
    .isIn(WORK_LINK_LABELS)
    .withMessage(`Link label must be one of: ${WORK_LINK_LABELS.join(', ')}`),
  textRule('cardLabel', LIMITS.cardLabel, 'Card link text'),
  body('featured').default(true).isBoolean({ strict: true }).withMessage('featured must be true or false'),
  body('tags').default([]).isArray({ max: LIMITS.tags }).withMessage(`You can add up to ${LIMITS.tags} tags`),
  body('tags.*')
    .isString()
    .withMessage('Each tag must be text')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Tags cannot be empty')
    .isLength({ max: LIMITS.tag })
    .withMessage(`Each tag can be up to ${LIMITS.tag} characters`),
  body('gallery').default([]).isArray({ max: LIMITS.gallery }).withMessage(`The gallery can hold up to ${LIMITS.gallery} images`),
  imageUrlRule('gallery.*.url', 'Gallery image', { required: true }),
  ...imageMetaRules('gallery.*', 'Gallery image'),
  body('gallery.*.layout')
    .default('full')
    .isIn(GALLERY_LAYOUTS)
    .withMessage(`Gallery image layout must be one of: ${GALLERY_LAYOUTS.join(', ')}`),
  validate,
];

export const reorderWorkValidator = [
  body('ids').isArray({ min: 1 }).withMessage('ids must be a list of work item ids'),
  body('ids.*').isMongoId().withMessage('Invalid work item id'),
  validate,
];

const sectionText = (field, max, label, { required = false } = {}) => {
  const chain = body(field).default('').isString().withMessage(`${label} must be text`).bail().trim();
  return (required ? chain.notEmpty().withMessage(`${label} is required`) : chain)
    .isLength({ max })
    .withMessage(`${label} can be up to ${max} characters`);
};

/** PUT /api/admin/projects/section: the whole heading (saved straight to the site). */
export const updateProjectsSectionValidator = [
  sectionText('badge', SECTION_LIMITS.badge, 'Badge', { required: true }),
  sectionText('title.plain', SECTION_LIMITS.plain, 'Title', { required: true }),
  sectionText('title.highlight', SECTION_LIMITS.highlight, 'Highlighted words'),
  sectionText('description', SECTION_LIMITS.description, 'Description'),
  sectionText('scrollButtonLabel', SECTION_LIMITS.scrollButtonLabel, 'Scroll hint'),
  sectionText('cardCtaLabel', SECTION_LIMITS.cardCtaLabel, 'Card link text', { required: true }),
  body('pageButtons')
    .optional()
    .isArray({ max: MAX_PAGE_BUTTONS })
    .withMessage(`The project page can have up to ${MAX_PAGE_BUTTONS} buttons`),
  body('pageButtons.*.label')
    .isString()
    .trim()
    .isLength({ max: SECTION_LIMITS.cardCtaLabel })
    .withMessage(`Button labels can be up to ${SECTION_LIMITS.cardCtaLabel} characters`),
  ...ctaRules('pageButtons.*'),
  validate,
];

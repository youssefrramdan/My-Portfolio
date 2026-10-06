import { body } from 'express-validator';
import { SECTION_HEADING_LIMITS as HEADING } from '../../../shared/content.js';
import { CTA_ACTIONS } from './schemas.js';
import { isHttpUrl, normalizeUrl } from './url.js';

/** Text at `field` with a max length; missing = empty. `required` also rejects an empty value. */
export const textRule = (field, max, label, { required = false } = {}) => {
  const chain = body(field).default('').isString().withMessage(`${label} must be text`).bail().trim();
  return (required ? chain.notEmpty().withMessage(`${label} is required`) : chain)
    .isLength({ max })
    .withMessage(`${label} can be up to ${max} characters`);
};

/**
 * A home section heading ("Main Details"): optional badge, title split into `plain` + `highlight` (green words at
 * the end, at least one word in total) and an optional description.
 */
export const sectionHeadingRules = () => [
  textRule('badge', HEADING.badge, 'Eyebrow'),
  textRule('title.plain', HEADING.title, 'Title'),
  textRule('title.highlight', HEADING.title, 'Highlighted words'),
  body('title').custom((title) => {
    const length = `${title?.plain ?? ''} ${title?.highlight ?? ''}`.trim().length;
    if (!length) throw new Error('Title is required');
    if (length > HEADING.title) throw new Error(`Title can be up to ${HEADING.title} characters`);
    return true;
  }),
  textRule('description', HEADING.description, 'Subtitle'),
];

/** Optional `{ url, publicId, alt }` image at `field` (an empty url = no image). */
export const optionalImageRules = (field, label, altMax) => [
  body(`${field}.url`)
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isURL({ protocols: ['https', 'http'], require_protocol: true })
    .withMessage(`${label} must be a valid image URL`),
  body(`${field}.publicId`).optional().isString().trim(),
  body(`${field}.alt`).optional().isString().trim().isLength({ max: altMax }).withMessage(`${label} alt text can be up to ${altMax} characters`),
];

export const reorderRules = (label) => [
  body('ids').isArray({ min: 1 }).withMessage(`ids must be a list of ${label} ids`),
  body('ids.*').isMongoId().withMessage(`Invalid ${label} id`),
];

/** Optional `{ url, publicId, alt }` image at `field`. */
export const imageRules = (field) => [
  body(`${field}.url`).optional().trim().isURL().withMessage(`${field}.url must be a valid URL`),
  body(`${field}.publicId`).optional().trim().isString(),
  body(`${field}.alt`).optional().trim().isString(),
];

const SECTION_ID = /^[A-Za-z][\w-]*$/;

const targetError = {
  scroll: 'must be a section id, e.g. "contact"',
  link: 'must be a valid http(s) URL',
};

/** Value at an express-validator path such as `pageButtons[1].action`. */
const valueAt = (source, path) =>
  path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .reduce((value, key) => value?.[key], source);

/**
 * Optional `{ label, action, target }` button at `field` (a body key, or `list.*` for every item of a list). When
 * sent, label and action are required; `target` must fit `action` (section id / http(s) URL with `https://` added
 * when missing). `email`, `whatsapp` and `cv` never have one (they use the Contact page email / number and the
 * uploaded resume).
 */
export const ctaRules = (field) => {
  const actionOf = (req, path) => valueAt(req.body, path.replace(/\.target$/, '.action'));
  const when = (chain) => (field.endsWith('.*') ? chain : chain.if(body(field).exists({ values: 'null' })));
  return [
    when(body(`${field}.label`)).trim().notEmpty().withMessage('Button label is required'),
    when(body(`${field}.action`))
      .isIn(CTA_ACTIONS)
      .withMessage(`Button action must be one of: ${CTA_ACTIONS.join(', ')}`),
    when(body(`${field}.target`))
      .default('')
      .trim()
      .customSanitizer((value, { req, path }) => {
        const action = actionOf(req, path);
        if (action === 'link') return normalizeUrl(value);
        if (action === 'scroll') return value.replace(/^#/, '');
        return '';
      })
      .custom((value, { req, path }) => {
        const action = actionOf(req, path);
        if (!targetError[action]) return true;
        if (!value) throw new Error('Choose where the button goes');
        const valid = (action === 'scroll' && SECTION_ID.test(value)) || (action === 'link' && isHttpUrl(value));
        if (!valid) throw new Error(`Button target ${targetError[action]}`);
        return true;
      }),
  ];
};

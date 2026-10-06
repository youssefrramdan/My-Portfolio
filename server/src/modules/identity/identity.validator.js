import { body } from 'express-validator';
import { ICON_NODE_LIMITS, isIconName } from '../../../../shared/icons.js';
import {
  HEX_COLOR,
  IDENTITY_CTA_ACTIONS,
  IDENTITY_LIMITS as LIMITS,
  IMAGE_INTERVAL,
  anchorIndex,
  titleWords,
} from '../../../../shared/identity.js';
import validate from '../../middleware/validate.js';
import { isHttpUrl, normalizeUrl } from '../../utils/url.js';
import { SECTION_ANCHORS } from '../page/page.sections.js';

/** Optional text with a max length. Drafts may leave required fields empty; publishing checks them. */
const textRule = (field, max, label = field) =>
  body(field)
    .default('')
    .isString()
    .withMessage(`${label} must be text`)
    .bail()
    .trim()
    .isLength({ max })
    .withMessage(`${label} can be up to ${max} characters`);

const urlRule = (field, label) =>
  body(field)
    .optional({ values: 'falsy' })
    .trim()
    .isURL({ protocols: ['https', 'http'], require_protocol: true })
    .withMessage(`${label} must be a valid URL`);

const imageRules = (field, label) => [
  urlRule(`${field}.url`, `${label} URL`),
  body(`${field}.publicId`).optional().isString().trim(),
  body(`${field}.alt`).optional().isString().trim().isLength({ max: LIMITS.alt }).withMessage(`${label} alt text can be up to ${LIMITS.alt} characters`),
];

const ctaRules = (field, name) => [
  textRule(`${field}.label`, LIMITS.ctaLabel, `The ${name} button label`),
  body(`${field}.action`)
    .isIn(IDENTITY_CTA_ACTIONS)
    .withMessage(`The ${name} button action must be one of: ${IDENTITY_CTA_ACTIONS.join(', ')}`),
  body(`${field}.target`)
    .default('')
    .isString()
    .trim()
    .customSanitizer((value, { req }) => {
      const action = req.body[field]?.action;
      if (action === 'link') return normalizeUrl(value);
      if (action === 'scroll') return value.replace(/^#/, '');
      return '';
    })
    .custom((value, { req }) => {
      const action = req.body[field]?.action;
      if (!value) return true;
      if (action === 'scroll' && !SECTION_ANCHORS.includes(value)) {
        throw new Error(`The ${name} button must scroll to one of: ${SECTION_ANCHORS.join(', ')}`);
      }
      if (action === 'link' && !isHttpUrl(value)) throw new Error(`The ${name} button link must be a valid http(s) URL`);
      return true;
    }),
];

const anchorRules = (field, when = (chain) => chain) => [
  when(body(`${field}.word`)).isString().trim().notEmpty().withMessage('An image spot or line break needs a word'),
  when(body(`${field}.occurrence`)).default(0).isInt({ min: 0 }).withMessage('occurrence must be 0 or more').toInt(),
];

/** Every image spot and the line break must point at a word of the title, one spot per word. */
const anchorsMatchTitle = body('title').custom((title, { req }) => {
  const words = titleWords(title);
  const slots = Array.isArray(req.body.imageSlots) ? req.body.imageSlots : [];
  const used = new Set();
  for (const slot of slots) {
    const index = anchorIndex(words, slot);
    if (index === -1) throw new Error(`The image spot after "${slot?.word}" points at a word that is not in the title`);
    if (used.has(index)) throw new Error(`There are two image spots after "${slot.word}"`);
    used.add(index);
  }
  const { lineBreak } = req.body;
  if (lineBreak) {
    const index = anchorIndex(words, lineBreak);
    if (index === -1) throw new Error(`The line break after "${lineBreak.word}" points at a word that is not in the title`);
    if (index === words.length - 1) throw new Error('The line break cannot come after the last word');
  }
  return true;
});

/** PUT /api/admin/identity: the whole draft. Formats and limits are checked; emptiness is checked on publish. */
export const saveIdentityValidator = [
  textRule('displayName', LIMITS.displayName, 'Display name'),
  textRule('role', LIMITS.role, 'Professional title'),
  textRule('title', LIMITS.title, 'Title'),
  textRule('description', LIMITS.description, 'Description'),
  anchorsMatchTitle,

  body('lineBreak').optional({ values: 'null' }).isObject().withMessage('lineBreak must be an object or null'),
  ...anchorRules('lineBreak', (chain) => chain.if(body('lineBreak').exists({ values: 'null' }))),

  body('imageSlots')
    .default([])
    .isArray({ max: LIMITS.imageSlots })
    .withMessage(`The title can have up to ${LIMITS.imageSlots} image spots`),
  ...anchorRules('imageSlots.*'),
  body('imageSlots.*.images')
    .default([])
    .isArray({ max: LIMITS.slotImages })
    .withMessage(`Each image spot can hold up to ${LIMITS.slotImages} images`),
  ...imageRules('imageSlots.*.images.*', 'Headline image'),

  ...ctaRules('ctaPrimary', 'primary'),
  ...ctaRules('ctaSecondary', 'secondary'),

  body('imageInterval')
    .optional()
    .isFloat({ min: IMAGE_INTERVAL.min, max: IMAGE_INTERVAL.max })
    .withMessage(`Time per image must be ${IMAGE_INTERVAL.min} to ${IMAGE_INTERVAL.max} seconds`)
    .toFloat(),

  ...imageRules('photo', 'Portrait'),
  textRule('photoCursor.label', LIMITS.cursorLabel, 'Photo cursor name'),
  body('photoCursor.color').optional().isString().trim().matches(HEX_COLOR).withMessage('Cursor color must look like #35d0ba'),
  body('photoCursor.background')
    .optional()
    .isString()
    .trim()
    .matches(HEX_COLOR)
    .withMessage('Name tag color must look like #35d0ba'),
  ...imageRules('logo', 'Logo'),
  urlRule('cv.url', 'Resume URL'),
  body('cv.publicId').optional().isString().trim(),
  body('cv.name').optional().isString().trim().isLength({ max: LIMITS.fileName }).withMessage('Resume file name is too long'),
  body('cv.bytes').optional().isInt({ min: 0 }).withMessage('cv.bytes must be 0 or more').toInt(),

  body('showSkillTags').default(true).isBoolean({ strict: true }).withMessage('showSkillTags must be true or false'),
  body('showStats').default(true).isBoolean({ strict: true }).withMessage('showStats must be true or false'),

  body('stats').default([]).isArray({ max: LIMITS.stats }).withMessage(`You can show up to ${LIMITS.stats} highlights`),
  body('stats.*.number')
    .isFloat({ min: 0, max: LIMITS.statNumber })
    .withMessage('Each highlight needs a number, e.g. 5 or 100')
    .toFloat(),
  textRule('stats.*.suffix', LIMITS.statSuffix, 'Highlight suffix'),
  textRule('stats.*.title', LIMITS.statTitle, 'Highlight title'),
  textRule('stats.*.label', LIMITS.statLabel, 'Highlight pill'),

  body('skillTags').default([]).isArray({ max: LIMITS.skillTags }).withMessage(`You can add up to ${LIMITS.skillTags} capability tags`),
  textRule('skillTags.*.label', LIMITS.skillLabel, 'Capability tag name'),
  body('skillTags.*.icon')
    .default('')
    .isString()
    .trim()
    .custom((icon) => !icon || isIconName(icon))
    .withMessage('Capability tag icon must be an icon name, e.g. "PenTool01Icon"'),
  body('skillTags.*.iconNodes')
    .optional({ values: 'null' })
    .isArray({ max: ICON_NODE_LIMITS.nodes })
    .withMessage('Capability tag icon drawing is not valid'),

  validate,
];

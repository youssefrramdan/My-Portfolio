import { body, param } from 'express-validator';
import { CAPABILITY_LIMITS as LIMITS } from '../../../../shared/capabilities.js';
import { ICON_NODE_LIMITS, isIconName } from '../../../../shared/icons.js';
import validate from '../../middleware/validate.js';
import { optionalImageRules, reorderRules, sectionHeadingRules, textRule } from '../../utils/validators.js';

export const groupIdValidator = [param('id').isMongoId().withMessage('Invalid group id'), validate];

/** PUT /api/admin/skills/:id: the whole draft. Formats and limits are checked; emptiness is checked on publish. */
export const saveGroupValidator = [
  param('id').isMongoId().withMessage('Invalid group id'),
  textRule('title', LIMITS.title, 'Group name'),
  body('glyph').optional({ values: 'null' }).isObject().withMessage('glyph must be an object'),
  body('glyph.name')
    .default('')
    .isString()
    .trim()
    .custom((name) => !name || isIconName(name))
    .withMessage('The icon must be an icon name, e.g. "PenTool01Icon"'),
  body('glyph.nodes').optional({ values: 'null' }).isArray({ max: ICON_NODE_LIMITS.nodes }).withMessage('The icon drawing is not valid'),
  ...optionalImageRules('icon', 'Icon', LIMITS.alt),
  body('items').default([]).isArray({ max: LIMITS.items }).withMessage(`A group can hold up to ${LIMITS.items} items`),
  body('items.*')
    .isString()
    .withMessage('Each item must be text')
    .bail()
    .trim()
    .isLength({ max: LIMITS.item })
    .withMessage(`Each item can be up to ${LIMITS.item} characters`),
  validate,
];

export const reorderGroupsValidator = [...reorderRules('group'), validate];

export const updateSkillsSectionValidator = [...sectionHeadingRules(), validate];

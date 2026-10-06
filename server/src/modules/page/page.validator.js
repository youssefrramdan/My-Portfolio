import { body } from 'express-validator';
import { NAV_LABEL_MAX } from '../../../../shared/content.js';
import validate from '../../middleware/validate.js';
import { findKeyProblem } from './page.sections.js';

/**
 * `{ sections: [{ key, isVisible, navLabel? }] }` in display order, every section key exactly once. A missing
 * `navLabel` keeps the stored one; '' = the default label.
 */
export const updatePageValidator = [
  body('sections')
    .isArray()
    .withMessage('sections must be an array')
    .bail()
    .custom((sections) => {
      const problem = findKeyProblem(sections.map((section) => section?.key));
      if (problem) throw new Error(problem);
      return true;
    }),
  body('sections.*.isVisible').isBoolean({ strict: true }).withMessage('isVisible must be true or false'),
  body('sections.*.navLabel')
    .optional()
    .isString()
    .withMessage('Nav label must be text')
    .bail()
    .trim()
    .isLength({ max: NAV_LABEL_MAX })
    .withMessage(`Nav labels can be up to ${NAV_LABEL_MAX} characters`),
  validate,
];

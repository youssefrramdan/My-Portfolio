import { body } from 'express-validator';
import { PASSWORD_LIMITS, SETTINGS_LIMITS } from '../../../../shared/settings.js';
import validate from '../../middleware/validate.js';
import { optionalImageRules, textRule } from '../../utils/validators.js';

const currentPasswordRule = () =>
  body('currentPassword')
    .isString()
    .withMessage('Enter your current password')
    .bail()
    .notEmpty()
    .withMessage('Enter your current password')
    .isLength({ max: PASSWORD_LIMITS.max })
    .withMessage('Current password is incorrect');

/** PUT /api/admin/account/profile: `{ name, title, avatar }` (the dashboard profile card). */
export const updateProfileValidator = [
  textRule('name', SETTINGS_LIMITS.profileName, 'Name', { required: true }),
  textRule('title', SETTINGS_LIMITS.profileTitle, 'Title'),
  ...optionalImageRules('avatar', 'Profile photo', SETTINGS_LIMITS.alt),
  validate,
];

/** PUT /api/admin/account/email: `{ email, currentPassword }`. */
export const updateEmailValidator = [
  body('email')
    .isString()
    .withMessage('Email is required')
    .bail()
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Email is required')
    .isLength({ max: 254 })
    .withMessage('Enter a valid email address')
    .isEmail()
    .withMessage('Enter a valid email address'),
  currentPasswordRule(),
  validate,
];

/** PUT /api/admin/account/password: `{ currentPassword, newPassword }`. Passwords are never trimmed. */
export const updatePasswordValidator = [
  currentPasswordRule(),
  body('newPassword')
    .isString()
    .withMessage('Enter a new password')
    .bail()
    .isLength({ min: PASSWORD_LIMITS.min })
    .withMessage(`Use at least ${PASSWORD_LIMITS.min} characters`)
    .isLength({ max: PASSWORD_LIMITS.max })
    .withMessage(`Use at most ${PASSWORD_LIMITS.max} characters`)
    .custom((value, { req }) => value !== req.body.currentPassword)
    .withMessage('The new password must be different from the current one'),
  validate,
];

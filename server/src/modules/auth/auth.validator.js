import { body } from 'express-validator';
import validate from '../../middleware/validate.js';

export const loginValidator = [
  body('email')
    .isString()
    .withMessage('Email is required')
    .trim()
    .toLowerCase()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Enter a valid email address')
    .isLength({ max: 254 })
    .withMessage('Enter a valid email address'),
  body('password')
    .isString()
    .withMessage('Password is required')
    .notEmpty()
    .withMessage('Password is required')
    // bcrypt only reads the first 72 bytes; longer input is rejected rather than silently cut.
    .isLength({ max: 72 })
    .withMessage('Invalid email or password'),
  validate,
];

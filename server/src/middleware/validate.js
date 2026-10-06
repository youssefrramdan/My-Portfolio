import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Runs after an array of express-validator chains and rejects the request with a 400
 * if any of them produced errors. Keep it as the LAST entry of a validator array:
 *
 *   export const createSkillValidator = [check('name').trim().notEmpty(), validate];
 *
 * Express 5 makes req.query read-only, so sanitized query values must be read with matchedData(req).
 */
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array({ onlyFirstError: true });
  const details = errors.map((e) => ({ field: e.path, message: e.msg }));
  const message = details.map((d) => d.message).join('. ');

  return next(new ApiError(message, 400, details));
};

export default validate;

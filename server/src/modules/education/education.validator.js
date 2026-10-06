import { body, param } from 'express-validator';
import { CREDENTIAL_KINDS, CREDENTIAL_LIMITS as LIMITS, CREDENTIALS_SECTION_LIMITS } from '../../../../shared/credentials.js';
import validate from '../../middleware/validate.js';
import { isHttpUrl, normalizeUrl } from '../../utils/url.js';
import { optionalImageRules, reorderRules, sectionHeadingRules, textRule } from '../../utils/validators.js';

export const credentialIdValidator = [param('id').isMongoId().withMessage('Invalid credential id'), validate];

/** PUT /api/admin/credentials/:id: the whole draft. Formats and limits are checked; emptiness is checked on publish. */
export const saveCredentialValidator = [
  param('id').isMongoId().withMessage('Invalid credential id'),
  textRule('title', LIMITS.title, 'Title'),
  body('kind').default('certificate').isIn(CREDENTIAL_KINDS).withMessage(`Kind must be one of: ${CREDENTIAL_KINDS.join(', ')}`),
  textRule('issuer', LIMITS.issuer, 'Issuer'),
  textRule('date', LIMITS.date, 'Date'),
  textRule('link', LIMITS.link, 'Verification link')
    .customSanitizer(normalizeUrl)
    .custom((link) => !link || isHttpUrl(link))
    .withMessage('Verification link must be a valid http(s) URL'),
  textRule('detail', LIMITS.detail, 'Note'),
  body('subjects').default([]).isArray({ max: LIMITS.subjects }).withMessage(`Up to ${LIMITS.subjects} subjects`),
  body('subjects.*')
    .isString()
    .withMessage('Each subject must be text')
    .bail()
    .trim()
    .isLength({ max: LIMITS.subject })
    .withMessage(`Each subject can be up to ${LIMITS.subject} characters`),
  textRule('label', LIMITS.label, 'Card label'),
  ...optionalImageRules('image', 'Image', LIMITS.alt),
  validate,
];

export const reorderCredentialsValidator = [...reorderRules('credential'), validate];

export const updateEducationSectionValidator = [
  ...sectionHeadingRules(),
  textRule('certificatesTitle', CREDENTIALS_SECTION_LIMITS.listTitle, 'List title'),
  validate,
];

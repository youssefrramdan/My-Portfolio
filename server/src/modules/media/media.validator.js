import { body, param, query } from 'express-validator';
import validate from '../../middleware/validate.js';
import { MEDIA_KINDS } from '../../../../shared/identity.js';
import { ALL_MEDIA, MEDIA_FOLDER_LIMITS as LIMITS, UNSORTED_MEDIA } from '../../../../shared/media.js';
import { MEDIA_FOLDER } from './mediaUpload.js';

const isFolderFilter = (value) => value === ALL_MEDIA || value === UNSORTED_MEDIA || /^[a-f\d]{24}$/i.test(value);

/** A folder id or null (= top level / Unsorted). */
const nullableFolder = (field) =>
  body(field).optional({ values: 'null' }).isMongoId().withMessage('Invalid folder id');

const folderName = (chain) =>
  chain
    .isString()
    .withMessage('Folder name must be text')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('Folder name is required')
    .isLength({ max: LIMITS.name })
    .withMessage(`Folder name can be up to ${LIMITS.name} characters`)
    .not()
    .matches(/[\\/]/)
    .withMessage('Folder name cannot contain / or \\');

export const listMediaValidator = [
  query('kind').optional().isIn(MEDIA_KINDS).withMessage(`kind must be one of: ${MEDIA_KINDS.join(', ')}`),
  query('search').optional().isString().trim().isLength({ max: 60 }).withMessage('search can be up to 60 characters'),
  query('folder').optional().isString().custom(isFolderFilter).withMessage('Invalid folder'),
  validate,
];

const fileName = () =>
  body('name')
    .isString()
    .withMessage('File name must be text')
    .bail()
    .trim()
    .notEmpty()
    .withMessage('File name is required')
    .isLength({ max: 255 })
    .withMessage('File name can be up to 255 characters');

const uploadFolder = () => body('folder').optional({ values: 'falsy' }).isMongoId().withMessage('Invalid folder id');

export const signUploadValidator = [
  fileName(),
  body('type').isString().withMessage('File type is required'),
  body('size').isInt({ min: 1 }).withMessage('File size is required').toInt(),
  uploadFolder(),
  validate,
];

export const uploadMediaValidator = [
  body('publicId')
    .isString()
    .matches(new RegExp(`^${MEDIA_FOLDER}/[a-z0-9-]+(\\.pdf)?$`))
    .withMessage('Invalid upload id'),
  body('kind').isIn(MEDIA_KINDS).withMessage(`kind must be one of: ${MEDIA_KINDS.join(', ')}`),
  fileName(),
  uploadFolder(),
  validate,
];

export const listFoldersValidator = [
  query('kind').optional().isIn(MEDIA_KINDS).withMessage(`kind must be one of: ${MEDIA_KINDS.join(', ')}`),
  validate,
];

export const createFolderValidator = [folderName(body('name')), nullableFolder('parent'), validate];

export const updateFolderValidator = [
  param('id').isMongoId().withMessage('Invalid folder id'),
  folderName(body('name').optional()),
  nullableFolder('parent'),
  body().custom((value) => 'name' in value || 'parent' in value).withMessage('Send a new name or parent'),
  validate,
];

export const folderIdValidator = [param('id').isMongoId().withMessage('Invalid folder id'), validate];

export const deleteMediaValidator = [
  body('ids')
    .isArray({ min: 1, max: LIMITS.moveBatch })
    .withMessage(`Send between 1 and ${LIMITS.moveBatch} item ids`),
  body('ids.*').isMongoId().withMessage('Invalid media id'),
  validate,
];

export const moveMediaValidator = [
  body('ids')
    .isArray({ min: 1, max: LIMITS.moveBatch })
    .withMessage(`Send between 1 and ${LIMITS.moveBatch} item ids`),
  body('ids.*').isMongoId().withMessage('Invalid media id'),
  nullableFolder('folder'),
  validate,
];

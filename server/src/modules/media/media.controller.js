import { matchedData } from 'express-validator';
import mongoose from 'mongoose';
import cloudinary from '../../config/cloudinary.js';
import { env } from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';
import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import Media from './media.model.js';
import * as folders from './mediaFolders.service.js';
import { findUsage } from './mediaUsage.service.js';
import { checkUpload, cleanFileName, resourceType, uploadParams, verifyUploaded } from './mediaUpload.js';

const LIST_LIMIT = 60;
const FIELDS = 'name url publicId kind format bytes width height folder createdAt';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function findResource(publicId, kind) {
  try {
    return await cloudinary.api.resource(publicId, { resource_type: resourceType(kind) });
  } catch (error) {
    if (error?.error?.http_code === 404 || error?.http_code === 404) throw ApiError.badRequest('The upload did not finish. Try again.');
    throw error;
  }
}

/**
 * GET /api/admin/media?kind=image&search=cv&folder=all|none|<id>: newest first, at most LIST_LIMIT items.
 * Searching inside a folder also searches its subfolders.
 */
export const listMedia = asyncHandler(async (req, res) => {
  const { kind, search, folder } = matchedData(req, { locations: ['query'] });
  const filter = {
    ...(kind && { kind }),
    ...(search && { name: mongoose.trusted({ $regex: escapeRegex(search), $options: 'i' }) }),
    ...(await folders.folderFilter(folder, search)),
  };
  const media = await Media.find(filter).sort({ createdAt: -1 }).limit(LIST_LIMIT).select(FIELDS).lean();
  sendSuccess(res, media);
});

/**
 * POST /api/admin/media/sign `{ name, type, size, folder? }`: step 1 of an upload. Checks the file type, size and
 * folder, then returns `{ kind, uploadUrl, fields }` for the browser to post the file straight to Cloudinary.
 * PDFs go up as `raw` so they are delivered as plain files.
 */
export const signUpload = asyncHandler(async (req, res) => {
  const { name, type, size, folder } = req.body;
  const kind = checkUpload({ type, size });
  await folders.uploadFolder(folder);
  const params = uploadParams(kind, cleanFileName(name).slug);
  const signature = cloudinary.utils.api_sign_request(params, env.CLOUDINARY_API_SECRET);
  sendSuccess(res, {
    kind,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resourceType(kind)}/upload`,
    fields: { ...params, api_key: env.CLOUDINARY_API_KEY, signature },
  });
});

/**
 * POST /api/admin/media `{ publicId, kind, name, folder? }`: step 2. Checks the file the browser uploaded and adds it
 * to the library (inside `folder` when given); a file that fails the checks is removed from Cloudinary.
 */
export const uploadMedia = asyncHandler(async (req, res) => {
  const { publicId: uploadedId, kind, name: fileName } = req.body;
  if (await Media.exists({ publicId: uploadedId })) throw ApiError.conflict('This file is already in the library');

  const result = await findResource(uploadedId, kind);
  try {
    await verifyUploaded(result, kind);
  } catch (error) {
    await cloudinary.uploader.destroy(uploadedId, { resource_type: resourceType(kind) }).catch(() => {});
    throw error;
  }

  const folder = await folders.uploadFolder(req.body.folder);
  const { base } = cleanFileName(fileName);
  const media = await Media.create({
    name: kind === 'file' ? `${base}.pdf` : base,
    url: result.secure_url,
    publicId: result.public_id,
    kind,
    folder,
    format: result.format ?? (kind === 'file' ? 'pdf' : ''),
    bytes: result.bytes,
    width: result.width,
    height: result.height,
  });

  const { _id, name, url, publicId, format, bytes, width, height, createdAt } = media;
  sendSuccess(res, { _id, name, url, publicId, kind, folder, format, bytes, width, height, createdAt }, 'File uploaded', 201);
});

/**
 * DELETE /api/admin/media `{ ids }`: removes files from the library and Cloudinary. Nothing is deleted when one of
 * them is still used on the site: 409 with `[{ id, name, usedIn }]` so the dashboard can say where.
 */
export const deleteMedia = asyncHandler(async (req, res) => {
  const items = await Media.find({ _id: mongoose.trusted({ $in: req.body.ids }) }).select('name publicId kind').lean();
  if (items.length === 0) throw ApiError.notFound('These files are no longer in the library');

  const usage = await findUsage(items.map((item) => item.publicId));
  const inUse = items
    .filter((item) => usage[item.publicId].length > 0)
    .map((item) => ({ id: item._id, name: item.name, usedIn: usage[item.publicId] }));
  if (inUse.length > 0) {
    throw ApiError.conflict(inUse.length === 1 ? 'This file is still used on your site' : 'Some files are still used on your site', inUse);
  }

  await Promise.all(
    ['image', 'file'].map((kind) => {
      const publicIds = items.filter((item) => item.kind === kind).map((item) => item.publicId);
      return publicIds.length ? cloudinary.api.delete_resources(publicIds, { resource_type: kind === 'image' ? 'image' : 'raw' }) : null;
    }),
  );
  await Media.deleteMany({ _id: mongoose.trusted({ $in: items.map((item) => item._id) }) });
  sendSuccess(res, { deleted: items.length }, items.length === 1 ? 'File deleted' : 'Files deleted');
});

/** PUT /api/admin/media/move `{ ids, folder }` (folder null = Unsorted). */
export const moveMedia = asyncHandler(async (req, res) => {
  const { ids, folder } = req.body;
  sendSuccess(res, await folders.moveMedia(ids, folder ?? null), 'Moved');
});

/** GET /api/admin/media/folders?kind=image: every folder with its item count, plus Unsorted / total counts. */
export const listFolders = asyncHandler(async (req, res) => {
  const { kind } = matchedData(req, { locations: ['query'] });
  sendSuccess(res, await folders.listFolders(kind));
});

export const createFolder = asyncHandler(async (req, res) => {
  const { name, parent } = req.body;
  sendSuccess(res, await folders.createFolder({ name, parent: parent ?? null }), 'Folder created', 201);
});

export const updateFolder = asyncHandler(async (req, res) => {
  const changes = {};
  if ('name' in req.body) changes.name = req.body.name;
  if ('parent' in req.body) changes.parent = req.body.parent ?? null;
  sendSuccess(res, await folders.updateFolder(req.params.id, changes), 'Folder saved');
});

export const deleteFolder = asyncHandler(async (req, res) => {
  sendSuccess(res, await folders.deleteFolder(req.params.id), 'Folder deleted');
});

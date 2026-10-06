import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cloudinary from '../../src/config/cloudinary.js';
import { env } from '../../src/config/env.js';
import logger from '../../src/config/logger.js';

const ASSETS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../assets');
const PLACEHOLDER_URL = 'https://placehold.co/800x500/161816/35d0ba/png?text=Missing+image';

const missing = [];

async function findExisting(publicId) {
  try {
    return await cloudinary.api.resource(publicId);
  } catch (error) {
    if (error?.error?.http_code === 404) return null;
    throw error;
  }
}

/**
 * Finds `seed/assets/<dir>/<baseName>.<any extension>` and returns its path relative to
 * `seed/assets`. When no file matches, the extension-less path is returned so
 * `uploadAsset` reports it as missing.
 */
export function assetByName(dir, baseName) {
  const folder = path.join(ASSETS_DIR, dir);
  const match = existsSync(folder)
    ? readdirSync(folder).find((file) => path.parse(file).name === baseName)
    : undefined;
  return path.posix.join(dir, match ?? baseName);
}

/** `hero` -> `<CLOUDINARY_FOLDER>/hero`. */
export const cloudFolder = (name) => `${env.CLOUDINARY_FOLDER}/${name}`;

/**
 * Uploads `seed/assets/<file>` to Cloudinary under a fixed public id, once, inside `CLOUDINARY_FOLDER`
 * (`folder` is the sub-folder). Re-running the seed reuses the existing asset (pass `force` to re-upload).
 * A missing local file is recorded and replaced by a placeholder image, or left empty with `placeholder: false`.
 */
export async function uploadAsset(file, { folder: subFolder, name, alt = '', force = false, placeholder = true }) {
  const folder = cloudFolder(subFolder);
  const publicId = `${folder}/${name}`;
  const filePath = path.join(ASSETS_DIR, file);

  if (!existsSync(filePath)) {
    missing.push(file);
    logger.warn(`Seed asset missing: seed/assets/${file} (${placeholder ? 'using a placeholder' : 'left empty'})`);
    return { url: placeholder ? PLACEHOLDER_URL : '', publicId: '', alt };
  }

  const existing = force ? null : await findExisting(publicId);
  if (existing) {
    logger.info(`Cloudinary: reused ${publicId}`);
    return { url: existing.secure_url, publicId: existing.public_id, alt };
  }

  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    public_id: name,
    overwrite: true,
    unique_filename: false,
    resource_type: 'image',
  });
  logger.info(`Cloudinary: uploaded ${result.public_id}`);
  return { url: result.secure_url, publicId: result.public_id, alt };
}

export const getMissingAssets = () => [...missing];

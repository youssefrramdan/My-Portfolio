import { MEDIA_LIMITS } from '../../../../shared/identity.js';
import cloudinary from '../../config/cloudinary.js';
import { env } from '../../config/env.js';
import ApiError from '../../utils/ApiError.js';

/** Cloudinary folder of every library file. */
export const MEDIA_FOLDER = `${env.CLOUDINARY_FOLDER}/media`;

/** Formats Cloudinary may accept for an image upload (it reads the file, so a renamed non-image is rejected). */
const IMAGE_FORMATS = ['jpg', 'png', 'webp', 'gif'];

export const resourceType = (kind) => (kind === 'image' ? 'image' : 'raw');

const limitOf = (kind) => (kind === 'image' ? MEDIA_LIMITS.imageBytes : MEDIA_LIMITS.fileBytes);

const tooLarge = (kind) =>
  new ApiError(`${kind === 'image' ? 'Images' : 'PDF files'} can be up to ${limitOf(kind) / 1024 / 1024} MB.`, 413);

/** The library kind of a declared file `type` and `size`, or throws a 400 / 413 before anything is uploaded. */
export function checkUpload({ type, size }) {
  const kind = MEDIA_LIMITS.imageTypes.includes(type) ? 'image' : MEDIA_LIMITS.fileTypes.includes(type) ? 'file' : null;
  if (!kind) throw ApiError.badRequest('Only JPG, PNG, WebP, GIF images and PDF files can be uploaded.');
  if (size > limitOf(kind)) throw tooLarge(kind);
  return kind;
}

/**
 * Signed parameters for one browser upload straight to Cloudinary (the file never passes through the API, which
 * keeps uploads under the hosting body limit). Only this exact `public_id` in `MEDIA_FOLDER` can be written.
 */
export function uploadParams(kind, slug) {
  const unique = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return {
    folder: MEDIA_FOLDER,
    public_id: kind === 'image' ? `${slug}-${unique}` : `${slug}-${unique}.pdf`,
    timestamp: Math.round(Date.now() / 1000),
    ...(kind === 'image' && { allowed_formats: IMAGE_FORMATS.join(',') }),
  };
}

/**
 * Checks a file the browser uploaded before it joins the library: its real size, and its content (Cloudinary
 * parsed images itself; a PDF must start with `%PDF-`). Throws a 400 / 413.
 */
export async function verifyUploaded(resource, kind) {
  if (resource.bytes > limitOf(kind)) throw tooLarge(kind);
  if (kind === 'image') {
    if (!IMAGE_FORMATS.includes(resource.format)) throw ApiError.badRequest('Only JPG, PNG, WebP and GIF images can be uploaded.');
    return;
  }
  // Signed API download: works even when the account blocks public PDF delivery.
  const url = cloudinary.utils.private_download_url(resource.public_id, undefined, { resource_type: 'raw', type: 'upload' });
  const response = await fetch(url, { headers: { Range: 'bytes=0-4' } });
  const head = response.ok ? Buffer.from(await response.arrayBuffer()).subarray(0, 5).toString('ascii') : '';
  if (head !== '%PDF-') throw ApiError.badRequest('This file is not a valid PDF.');
}

/** "../My CV (final).PDF" -> { base: "My CV (final)", slug: "my-cv-final" } */
export function cleanFileName(originalName = '') {
  const leaf = String(originalName).split(/[\\/]/).pop() ?? '';
  const base = leaf.replace(/\.[^.]+$/, '').trim().slice(0, 100) || 'file';
  const slug =
    base
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'file';
  return { base, slug };
}

/**
 * Adds Cloudinary delivery transformations (e.g. `c_fill,w_1200,h_630,f_jpg`) to a `res.cloudinary.com/.../upload/...`
 * URL. Other URLs are returned unchanged.
 */
export function cloudinaryUrl(url, transforms) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url ?? '';
  return url.replace('/upload/', `/upload/${transforms}/`);
}

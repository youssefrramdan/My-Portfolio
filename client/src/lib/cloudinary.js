/**
 * Adds Cloudinary delivery transformations (auto format/quality, optional width) to a
 * `res.cloudinary.com/.../upload/...` URL. Other URLs and SVGs (already vector) are returned unchanged.
 */
export function cldUrl(url, { width } = {}) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  if (url.endsWith('.svg')) return url;
  const transforms = ['f_auto', 'q_auto', width && `w_${width}`, width && 'c_limit']
    .filter(Boolean)
    .join(',');
  return url.replace('/upload/', `/upload/${transforms}/`);
}

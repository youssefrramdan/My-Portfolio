const fileNameOf = (url) => decodeURIComponent(new URL(url).pathname.split('/').pop() || 'file');

/**
 * Saves `url` to the device as `name`. The `download` attribute is ignored for other origins (Cloudinary), so the
 * file is fetched and saved from a blob URL. Fails silently: the link's own new tab still shows the file.
 */
export async function saveFile(url, name) {
  try {
    const response = await fetch(url);
    if (!response.ok) return;
    const blobUrl = URL.createObjectURL(await response.blob());
    const link = Object.assign(document.createElement('a'), { href: blobUrl, download: name || fileNameOf(url) });
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
  } catch {
    // Network or CORS failure: the opened tab is the fallback.
  }
}

/** Link props for the resume: opens it in a new tab and also saves a copy to the device. */
export const cvLinkProps = (cv) =>
  cv?.url
    ? { href: cv.url, target: '_blank', rel: 'noopener noreferrer', onClick: () => saveFile(cv.url, cv.name) }
    : null;

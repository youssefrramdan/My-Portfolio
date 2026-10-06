/** "Youssef Ramadan" -> "Youssef" */
export const firstName = (name = '') => name.trim().split(/\s+/)[0] ?? '';

/** "https://yousseframadan.dev/" -> "yousseframadan.dev" */
export function displayHost(url = '') {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/** Today's date in the browser's locale, e.g. "Wednesday, 26 February". */
export function formatToday(date = new Date()) {
  const parts = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).formatToParts(date);
  const get = (type) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('weekday')}, ${get('day')} ${get('month')}`;
}

/** 2368536 -> "2.3 MB", 44 -> "44 B" */
export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Sidebar "Content" badge: everything listed in the content library. */
export const contentTotal = (overview) =>
  overview
    ? overview.counts.work +
      overview.counts.capabilities +
      overview.counts.credentials +
      overview.counts.testimonials +
      overview.media.count
    : null;

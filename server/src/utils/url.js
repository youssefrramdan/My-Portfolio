const HAS_PROTOCOL = /^[a-z][a-z\d+.-]*:\/\//i;

/** "linkedin.com/in/x" -> "https://linkedin.com/in/x". Empty stays empty; URLs with a protocol are kept. */
export const normalizeUrl = (value) => {
  const url = String(value ?? '').trim();
  if (!url) return '';
  return HAS_PROTOCOL.test(url) ? url : `https://${url}`;
};

/** True for an absolute http(s) URL with a host. */
export const isHttpUrl = (value) => {
  try {
    const { protocol, hostname } = new URL(value);
    return (protocol === 'http:' || protocol === 'https:') && hostname.includes('.');
  } catch {
    return false;
  }
};

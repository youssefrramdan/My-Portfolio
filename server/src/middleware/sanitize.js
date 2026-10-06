/**
 * Removes MongoDB operator keys (`$...`) and dotted keys from req.body and req.params.
 * Replaces express-mongo-sanitize, which is incompatible with Express 5.
 * req.query needs no cleanup: Express 5's default "simple" parser never builds nested objects.
 */
const isUnsafeKey = (key) => key.startsWith('$') || key.includes('.');

function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !isUnsafeKey(key))
        .map(([key, val]) => [key, clean(val)]),
    );
  }
  return value;
}

const sanitize = (req, res, next) => {
  if (req.body) req.body = clean(req.body);
  if (req.params) req.params = clean(req.params);
  next();
};

export default sanitize;

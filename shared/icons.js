/**
 * Icons chosen in the dashboard. Two kinds of names are stored:
 * - a lucide name in kebab-case ("pen-tool"), the older curated set, rendered by name;
 * - a Hugeicons export name ("PenTool01Icon"), saved together with its drawing (`nodes`, the `[tag, attributes]`
 *   pairs the Hugeicons packages ship) so the site renders it without loading the 6000-icon set.
 * `nodes` come from the dashboard, so only plain SVG shapes and drawing attributes are kept.
 */
export const LUCIDE_NAME = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const HUGEICON_NAME = /^[A-Z][A-Za-z0-9]*Icon$/;

export const isIconName = (name) => typeof name === 'string' && (LUCIDE_NAME.test(name) || HUGEICON_NAME.test(name));
export const isHugeiconName = (name) => typeof name === 'string' && HUGEICON_NAME.test(name);

export const ICON_NODE_LIMITS = { nodes: 24, value: 6000 };

const SHAPES = new Set(['path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon']);
const ATTRIBUTES = new Set([
  'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'points', 'transform',
  'fill', 'fillRule', 'clipRule', 'opacity', 'fillOpacity', 'stroke', 'strokeWidth', 'strokeLinecap',
  'strokeLinejoin', 'strokeMiterlimit', 'strokeOpacity', 'key',
]);
/** Paint only from the text color or none: no `url(...)` references. */
const PAINT = /^(currentColor|none)$/;
const SAFE_VALUE = /^[A-Za-z0-9 .,\-#%()]*$/;

function cleanAttributes(attributes) {
  const clean = {};
  for (const [name, raw] of Object.entries(attributes ?? {})) {
    if (!ATTRIBUTES.has(name)) continue;
    const value = String(raw);
    if (value.length > ICON_NODE_LIMITS.value || !SAFE_VALUE.test(value)) continue;
    if ((name === 'fill' || name === 'stroke') && !PAINT.test(value)) continue;
    clean[name] = value;
  }
  return clean;
}

/** Hugeicons drawing with unknown shapes / attributes dropped; `[]` when nothing usable is left. */
export function cleanIconNodes(nodes) {
  if (!Array.isArray(nodes)) return [];
  return nodes
    .slice(0, ICON_NODE_LIMITS.nodes)
    .filter((node) => Array.isArray(node) && SHAPES.has(node[0]) && node[1] && typeof node[1] === 'object')
    .map(([tag, attributes], index) => [tag, { ...cleanAttributes(attributes), key: String(index) }]);
}

/** `{ name, nodes }` kept only when it is a usable icon (a lucide name, or a Hugeicons name with a drawing). */
export function normalizeIcon(name, nodes) {
  const value = typeof name === 'string' ? name.trim() : '';
  if (!isIconName(value)) return { name: '', nodes: [] };
  if (!isHugeiconName(value)) return { name: value, nodes: [] };
  const clean = cleanIconNodes(nodes);
  return clean.length ? { name: value, nodes: clean } : { name: '', nodes: [] };
}

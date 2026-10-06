import { filled } from './content.js';

/** Capabilities (skill groups) rules shared by the server and the dashboard. Change them here only. */
export const CAPABILITY_LIMITS = {
  title: 40,
  item: 40,
  items: 20,
  alt: 150,
};

/** Above this many items a group still saves, but the card on the live site gets crowded. */
export const CAPABILITY_SOFT_ITEMS = 10;

/** The "Tools & Methods" section has four card slots. */
export const MAX_PUBLISHED_GROUPS = 4;

/** What blocks publishing a group (`[{ field, message }]`). */
export function capabilityPublishProblems(group = {}) {
  const problems = [];
  if (!filled(group.title)) problems.push({ field: 'title', message: 'Add a group name' });
  if (!(group.items ?? []).some(filled)) problems.push({ field: 'items', message: 'Add at least one item' });
  return problems;
}

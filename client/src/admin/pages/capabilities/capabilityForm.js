import { z } from 'zod';
import { CAPABILITY_LIMITS as LIMITS } from '@shared/capabilities';
import { isIconName } from '@shared/icons';
import { tooLong } from '../../lib/contentItems';

const text = (max) => z.string().max(max, tooLong(max));

let nextKey = 0;
/** Items are edited as `{ key, value }` so rows keep their identity while they are dragged. */
export const newItem = (value = '') => ({ key: `item-${(nextKey += 1)}`, value });

/** Client copy of the server draft rules (`skills.validator.js`); emptiness is checked on publish. */
export const capabilitySchema = z.object({
  title: text(LIMITS.title),
  glyph: z.object({ name: z.string().refine((name) => !name || isIconName(name)), nodes: z.array(z.any()) }),
  icon: z.object({ url: z.string(), publicId: z.string(), alt: text(LIMITS.alt) }),
  items: z.array(z.object({ key: z.string(), value: text(LIMITS.item) })).max(LIMITS.items),
});

export const EMPTY_GLYPH = { name: '', nodes: [] };

export function toForm(content = {}) {
  return {
    title: content.title ?? '',
    glyph: { name: content.glyph?.name ?? '', nodes: content.glyph?.nodes ?? [] },
    icon: { url: content.icon?.url ?? '', publicId: content.icon?.publicId ?? '', alt: content.icon?.alt ?? '' },
    items: (content.items ?? []).map((value) => newItem(value)),
  };
}

export const toPayload = (values) => ({ ...values, items: values.items.map((item) => item.value.trim()) });

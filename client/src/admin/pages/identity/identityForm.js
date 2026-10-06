import { z } from 'zod';
import { isIconName } from '@shared/icons';
import {
  formatStatValue,
  HEX_COLOR,
  IDENTITY_LIMITS as LIMITS,
  IMAGE_INTERVAL,
  parseStatValue,
  PHOTO_CURSOR,
} from '@shared/identity';
import { ctaSchema } from '../../lib/cta';
import { IDENTITY } from './constants';

const { validation: messages } = IDENTITY;
const text = (max) => z.string().max(max, messages.tooLong(max));

const anchor = z.object({ word: z.string(), occurrence: z.number().int().min(0) });
const image = z.object({ url: z.string(), publicId: z.string().optional(), alt: text(LIMITS.alt).optional() });

const cta = ctaSchema({ urlMessage: messages.url });

/**
 * Client copy of the server draft rules (`identity.validator.js`): lengths, formats and limits. Empty required
 * fields are allowed in a draft; publishing checks them (`publishProblems`).
 */
export const identitySchema = z.object({
  displayName: text(LIMITS.displayName),
  role: text(LIMITS.role),
  title: text(LIMITS.title),
  description: text(LIMITS.description),
  lineBreak: anchor.nullable(),
  imageSlots: z.array(anchor.extend({ images: z.array(image).max(LIMITS.slotImages) })).max(LIMITS.imageSlots),
  imageInterval: z
    .number({ error: messages.interval })
    .min(IMAGE_INTERVAL.min, messages.interval)
    .max(IMAGE_INTERVAL.max, messages.interval),
  ctaPrimary: cta,
  ctaSecondary: cta,
  photo: image,
  photoCursor: z.object({
    label: text(LIMITS.cursorLabel),
    color: z.string().regex(HEX_COLOR, messages.color),
    background: z.string().regex(HEX_COLOR, messages.color),
  }),
  logo: image,
  cv: z.object({ url: z.string(), publicId: z.string().optional(), name: z.string().optional(), bytes: z.number().optional() }),
  showSkillTags: z.boolean(),
  skillTags: z
    .array(
      z.object({
        label: text(LIMITS.skillLabel),
        icon: z.string().refine((icon) => !icon || isIconName(icon)),
        iconNodes: z.array(z.any()),
      }),
    )
    .max(LIMITS.skillTags),
  showStats: z.boolean(),
  stats: z
    .array(
      z.object({
        value: z.string().refine((value) => parseStatValue(value) !== null, messages.statValue),
        title: text(LIMITS.statTitle),
        label: text(LIMITS.statLabel),
      }),
    )
    .max(LIMITS.stats),
});

const emptyCta = { label: '', action: 'scroll', target: '' };
const pickImage = (value) => ({ url: value?.url ?? '', publicId: value?.publicId ?? '', alt: value?.alt ?? '' });

/** Identity from the API -> form values (stats edited as "5+"). */
export function toForm(identity = {}) {
  return {
    displayName: identity.displayName ?? '',
    role: identity.role ?? '',
    title: identity.title ?? '',
    description: identity.description ?? '',
    lineBreak: identity.lineBreak ?? null,
    imageSlots: (identity.imageSlots ?? []).map((slot) => ({
      word: slot.word,
      occurrence: slot.occurrence ?? 0,
      images: (slot.images ?? []).map(pickImage),
    })),
    imageInterval: identity.imageInterval ?? IMAGE_INTERVAL.default,
    ctaPrimary: { ...emptyCta, ...identity.ctaPrimary },
    ctaSecondary: { ...emptyCta, ...identity.ctaSecondary },
    photo: pickImage(identity.photo),
    photoCursor: {
      label: identity.photoCursor?.label ?? '',
      color: identity.photoCursor?.color ?? PHOTO_CURSOR.color,
      background: identity.photoCursor?.background ?? PHOTO_CURSOR.background,
    },
    logo: pickImage(identity.logo),
    cv: {
      url: identity.cv?.url ?? '',
      publicId: identity.cv?.publicId ?? '',
      name: identity.cv?.name ?? '',
      bytes: identity.cv?.bytes ?? 0,
    },
    showSkillTags: identity.showSkillTags ?? true,
    skillTags: (identity.skillTags ?? []).map((tag) => ({
      label: tag.label ?? '',
      icon: tag.icon ?? '',
      iconNodes: tag.iconNodes ?? [],
    })),
    showStats: identity.showStats ?? true,
    stats: (identity.stats ?? []).map((stat) => ({
      value: formatStatValue(stat),
      title: stat.title ?? '',
      label: stat.label ?? '',
    })),
  };
}

/** Form values -> the draft body for `PUT /api/admin/identity` (and the shared completion / preview helpers). */
export function toPayload(values) {
  const { stats, ...rest } = values;
  return {
    ...rest,
    stats: stats.map(({ value, title, label }) => ({ ...(parseStatValue(value) ?? { number: 0, suffix: '' }), title, label })),
  };
}

export const newStat = () => ({ value: '0', title: '', label: '' });
export const newSkillTag = () => ({ label: '', icon: 'sparkles', iconNodes: [] });

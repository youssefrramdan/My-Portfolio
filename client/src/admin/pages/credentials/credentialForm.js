import { z } from 'zod';
import { CREDENTIAL_KINDS, CREDENTIAL_LIMITS as LIMITS } from '@shared/credentials';
import { isUrlLike, tooLong } from '../../lib/contentItems';
import { CREDENTIAL_EDITOR } from './constants';

const text = (max) => z.string().max(max, tooLong(max));

/** Client copy of the server draft rules (`education.validator.js`); emptiness is checked on publish. */
export const credentialSchema = z.object({
  title: text(LIMITS.title),
  kind: z.enum(CREDENTIAL_KINDS),
  issuer: text(LIMITS.issuer),
  date: text(LIMITS.date),
  link: z
    .string()
    .max(LIMITS.link, tooLong(LIMITS.link))
    .refine((value) => !value.trim() || isUrlLike(value), CREDENTIAL_EDITOR.validation.url),
  detail: text(LIMITS.detail),
  subjects: z.array(text(LIMITS.subject)).max(LIMITS.subjects),
  label: text(LIMITS.label),
  image: z.object({ url: z.string(), publicId: z.string(), alt: text(LIMITS.alt) }),
});

export const toForm = (content = {}) => ({
  title: content.title ?? '',
  kind: CREDENTIAL_KINDS.includes(content.kind) ? content.kind : 'certificate',
  issuer: content.issuer ?? '',
  date: content.date ?? '',
  link: content.link ?? '',
  detail: content.detail ?? '',
  subjects: content.subjects ?? [],
  label: content.label ?? '',
  image: { url: content.image?.url ?? '', publicId: content.image?.publicId ?? '', alt: content.image?.alt ?? '' },
});

export const toPayload = (values) => ({ ...values, link: values.link.trim(), label: values.label.trim() });

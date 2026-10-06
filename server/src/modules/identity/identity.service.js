import {
  clampImageInterval,
  CTA_ACTIONS_WITH_TARGET,
  IDENTITY_CTA_ACTIONS,
  cursorColor,
  orphanedAnchors,
  PHOTO_CURSOR,
  publishProblems,
} from '../../../../shared/identity.js';
import { normalizeIcon } from '../../../../shared/icons.js';
import ApiError from '../../utils/ApiError.js';
import Hero from '../hero/hero.model.js';
import { completeSections, scrollTargets } from '../page/page.sections.js';
import PageLayout from '../page/pageLayout.model.js';
import Settings from '../settings/settings.model.js';
import IdentityDraft from './identityDraft.model.js';

const SINGLETON_UPDATE = { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true };

/** Top-level Identity fields, in the order the dashboard lists changes. */
export const IDENTITY_KEYS = [
  'displayName',
  'role',
  'title',
  'description',
  'lineBreak',
  'imageSlots',
  'imageInterval',
  'ctaPrimary',
  'ctaSecondary',
  'photo',
  'photoCursor',
  'logo',
  'cv',
  'showSkillTags',
  'skillTags',
  'showStats',
  'stats',
];

const text = (value) => (typeof value === 'string' ? value.trim() : '');
const image = (value) => ({ url: text(value?.url), publicId: text(value?.publicId), alt: text(value?.alt) });
const file = (value) => ({
  url: text(value?.url),
  publicId: text(value?.publicId),
  name: text(value?.name),
  bytes: Number(value?.bytes) || 0,
});
const anchor = (value) =>
  text(value?.word) ? { word: text(value.word), occurrence: Math.max(0, Number.parseInt(value.occurrence, 10) || 0) } : null;

function cta(value) {
  const action = IDENTITY_CTA_ACTIONS.includes(value?.action) ? value.action : 'scroll';
  return { label: text(value?.label), action, target: CTA_ACTIONS_WITH_TARGET.includes(action) ? text(value?.target) : '' };
}

/** The dashboard shape with every field present and only known keys kept. */
export function normalizeIdentity(input = {}) {
  return {
    displayName: text(input.displayName),
    role: text(input.role),
    title: text(input.title),
    description: text(input.description),
    lineBreak: anchor(input.lineBreak),
    imageSlots: (input.imageSlots ?? [])
      .map((slot) => ({ ...anchor(slot), images: (slot?.images ?? []).map(image).filter((item) => item.url) }))
      .filter((slot) => slot.word),
    ctaPrimary: cta(input.ctaPrimary),
    imageInterval: clampImageInterval(input.imageInterval),
    ctaSecondary: cta(input.ctaSecondary),
    photo: image(input.photo),
    photoCursor: {
      label: text(input.photoCursor?.label),
      color: cursorColor(input.photoCursor?.color, PHOTO_CURSOR.color),
      background: cursorColor(input.photoCursor?.background, PHOTO_CURSOR.background),
    },
    logo: image(input.logo),
    cv: file(input.cv),
    showSkillTags: input.showSkillTags !== false,
    skillTags: (input.skillTags ?? []).map((tag) => {
      const icon = normalizeIcon(tag?.icon, tag?.iconNodes);
      return { label: text(tag?.label), icon: icon.name, iconNodes: icon.nodes };
    }),
    showStats: input.showStats !== false,
    stats: (input.stats ?? []).map((stat) => ({
      label: text(stat?.label),
      number: Number(stat?.number) || 0,
      suffix: text(stat?.suffix),
      title: text(stat?.title),
    })),
  };
}

/** Published Hero + Settings in the dashboard shape. */
export const toIdentity = (hero, settings) =>
  normalizeIdentity({
    displayName: hero?.backgroundText,
    role: hero?.role,
    title: hero?.title,
    description: hero?.intro,
    lineBreak: hero?.headline?.lineBreak,
    imageSlots: hero?.headline?.imageSlots,
    ctaPrimary: hero?.ctaPrimary,
    imageInterval: hero?.headline?.interval,
    ctaSecondary: hero?.ctaSecondary,
    photo: hero?.photo,
    photoCursor: hero?.photoCursor,
    logo: settings?.avatar,
    cv: settings?.cv,
    showSkillTags: hero?.showSkillTags,
    skillTags: hero?.skillTags,
    showStats: hero?.showStats,
    stats: hero?.stats,
  });

const changedKeys = (draft, published) =>
  IDENTITY_KEYS.filter((key) => JSON.stringify(draft[key]) !== JSON.stringify(published[key]));

async function loadPublished() {
  const [hero, settings] = await Promise.all([Hero.findOne().lean(), Settings.findOne().lean()]);
  return {
    published: toIdentity(hero, settings),
    contactEmail: settings?.contactEmail ?? '',
    whatsapp: settings?.whatsapp ?? '',
  };
}

/**
 * Everything the Identity page needs: the draft (or the published identity when there is no draft), which
 * fields differ from what is live, the contact email the "Send email" action uses, and the sections a
 * "Scroll to section" button can target.
 */
export async function getIdentityState() {
  const [{ published, contactEmail, whatsapp }, draft, layout] = await Promise.all([
    loadPublished(),
    IdentityDraft.findOne().lean(),
    PageLayout.findOne().select('sections').lean(),
  ]);
  const identity = draft ? normalizeIdentity(draft.data) : published;
  return {
    identity,
    changes: changedKeys(identity, published),
    hasDraft: Boolean(draft),
    draftSavedAt: draft?.updatedAt ?? null,
    contactEmail,
    whatsapp,
    sections: scrollTargets(completeSections(layout?.sections)),
  };
}

/** Saves the whole draft. A draft identical to the live identity is removed (nothing left to publish). */
export async function saveDraft(input) {
  const identity = normalizeIdentity(input);
  const { published } = await loadPublished();
  if (changedKeys(identity, published).length) {
    await IdentityDraft.findOneAndUpdate({}, { data: identity }, SINGLETON_UPDATE);
  } else {
    await IdentityDraft.deleteMany({});
  }
  return getIdentityState();
}

/** Copies the draft into Hero (+ logo and CV into Settings), then deletes the draft. */
export async function publishDraft() {
  const draft = await IdentityDraft.findOne().lean();
  if (!draft) throw ApiError.badRequest('There are no changes to publish.');

  const identity = normalizeIdentity(draft.data);
  const orphans = orphanedAnchors(identity);
  const problems = [
    ...publishProblems(identity),
    ...(orphans.slots.length || orphans.lineBreak
      ? [{ field: 'title', message: 'Some image spots point at words that are no longer in the title' }]
      : []),
  ];
  if (problems.length) {
    throw new ApiError(`Fill in the missing details before publishing: ${problems.map((p) => p.message).join('. ')}`, 400, problems);
  }

  const hero = {
    role: identity.role,
    title: identity.title,
    intro: identity.description,
    backgroundText: identity.displayName,
    photo: identity.photo,
    photoCursor: identity.photoCursor,
    headline: { lineBreak: identity.lineBreak, imageSlots: identity.imageSlots, interval: identity.imageInterval },
    showSkillTags: identity.showSkillTags,
    skillTags: identity.skillTags,
    showStats: identity.showStats,
    stats: identity.stats,
    ctaPrimary: identity.ctaPrimary,
    ctaSecondary: identity.ctaSecondary,
  };

  await Hero.validate(hero);
  await Hero.findOneAndUpdate({}, hero, SINGLETON_UPDATE);
  await Settings.findOneAndUpdate({}, { avatar: identity.logo, cv: identity.cv }, SINGLETON_UPDATE);
  await IdentityDraft.deleteMany({});
  return getIdentityState();
}

/** Drops the draft; the page goes back to the live identity. */
export async function discardDraft() {
  await IdentityDraft.deleteMany({});
  return getIdentityState();
}

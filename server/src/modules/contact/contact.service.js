import mongoose from 'mongoose';
import { completeSections, scrollTargets } from '../page/page.sections.js';
import PageLayout from '../page/pageLayout.model.js';
import Settings from '../settings/settings.model.js';
import SocialLink from '../settings/socialLink.model.js';
import ContactSection from './contactSection.model.js';

const SINGLETON_UPDATE = { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true };
const SECTION_FIELDS = '-_id -__v -createdAt -updatedAt';
const SOCIAL_SORT = { order: 1, createdAt: 1 };

export const getContactSection = () => ContactSection.findOne().select(SECTION_FIELDS).lean();

/**
 * Everything the Contact page needs: the contact email, the social links in display order, the section copy and
 * buttons, the sections a "Scroll to section" button can target, and whether a CV is published (`hasCv`).
 */
export async function getContactState() {
  const [settings, socials, section, layout] = await Promise.all([
    Settings.findOne().select('contactEmail whatsapp cv.url').lean(),
    SocialLink.find({ isActive: true }).sort(SOCIAL_SORT).select('platform url -_id').lean(),
    getContactSection(),
    PageLayout.findOne().select('sections').lean(),
  ]);
  return {
    contactEmail: settings?.contactEmail ?? '',
    whatsapp: settings?.whatsapp ?? '',
    socials,
    section,
    sections: scrollTargets(completeSections(layout?.sections)),
    hasCv: Boolean(settings?.cv?.url),
  };
}

/**
 * Saves the contact email, the WhatsApp number, the social links (the list replaces the stored one: missing platforms are removed,
 * array order = display order) and the two buttons. Goes live right away.
 */
export async function saveContact({ contactEmail, whatsapp = '', socials, primaryCta, secondaryCta }) {
  const platforms = socials.map((social) => social.platform);
  await Promise.all([
    Settings.findOneAndUpdate({}, { contactEmail, whatsapp }, SINGLETON_UPDATE),
    // `sanitizeFilter` is on globally, so our own operator has to be marked as trusted.
    SocialLink.deleteMany({ platform: mongoose.trusted({ $nin: platforms }) }),
    ...socials.map(({ platform, url }, order) =>
      SocialLink.findOneAndUpdate({ platform }, { url, order, isActive: true }, SINGLETON_UPDATE),
    ),
    ContactSection.findOneAndUpdate(
      {},
      secondaryCta ? { primaryCta, secondaryCta } : { primaryCta, $unset: { secondaryCta: 1 } },
      SINGLETON_UPDATE,
    ),
  ]);
  return getContactState();
}

/** "Main Details": eyebrow, title and the line under it. */
export const updateContactSection = ({ badge, title, description }) =>
  ContactSection.findOneAndUpdate({}, { badge, title, description }, SINGLETON_UPDATE).select(SECTION_FIELDS).lean();

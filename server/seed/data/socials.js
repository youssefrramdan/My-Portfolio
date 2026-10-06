import SocialLink from '../../src/modules/settings/socialLink.model.js';

/**
 * The eight icons on the Contact arc (Figma 616:14049). The site places them bottom-to-top, alternating
 * left / right, so this order reproduces the Figma arc: left WhatsApp, Discord, LinkedIn, Instagram;
 * right X, GitHub, Telegram, Behance. Upserted by platform, so re-running never duplicates.
 */
const SOCIALS = [
  { platform: 'whatsapp', url: 'https://wa.me/201000000000' }, // TODO: placeholder
  { platform: 'x', url: 'https://x.com/youssefrramdan' }, // TODO: placeholder
  { platform: 'discord', url: 'https://discord.com/users/youssefrramdan' }, // TODO: placeholder
  { platform: 'github', url: 'https://github.com/youssefrramdan' },
  { platform: 'linkedin', url: 'https://linkedin.com/in/youssefrramdan' }, // TODO: placeholder
  { platform: 'telegram', url: 'https://t.me/youssefrramdan' }, // TODO: placeholder
  { platform: 'instagram', url: 'https://instagram.com/youssefrramdan' }, // TODO: placeholder
  { platform: 'behance', url: 'https://behance.net/youssefrramdan' }, // TODO: placeholder
];

export default async function seedSocials() {
  await Promise.all(
    SOCIALS.map((social, order) =>
      SocialLink.findOneAndUpdate(
        { platform: social.platform },
        { ...social, order, isActive: true },
        { upsert: true, runValidators: true, setDefaultsOnInsert: true },
      ),
    ),
  );
  return SocialLink.countDocuments();
}

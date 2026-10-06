import { whatsappUrl } from '@shared/identity';
import { cvLinkProps } from './download';

const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' };

/** Gmail compose window addressed to `email`. */
export const gmailComposeUrl = (email) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;

/**
 * `href` + link props for each CMS button action. `scroll` relies on the global smooth scroll of `html`.
 * `email` / `whatsapp` use the contact email / WhatsApp number from Settings (never a target of their own);
 * `cv` opens the uploaded resume and saves a copy to the device.
 */
const ACTIONS = {
  scroll: (target) => target && { href: `#${target.replace(/^#/, '')}` },
  email: (_target, { email }) => email && { href: gmailComposeUrl(email), ...NEW_TAB },
  whatsapp: (_target, { whatsapp }) => whatsappUrl(whatsapp) && { href: whatsappUrl(whatsapp), ...NEW_TAB },
  link: (target) => target && { href: target, ...NEW_TAB },
  cv: (_target, { cvUrl, cvName }) => cvLinkProps({ url: cvUrl, name: cvName }),
};

/**
 * Link props for a CMS `{ label, action, target }` button, or `null` when the button should not render (missing
 * CTA, empty label, unknown action, or nothing to point at). `context`: `{ email, whatsapp, cvUrl, cvName }` from
 * Settings.
 */
export function ctaLink(cta, context = {}) {
  const label = cta?.label?.trim();
  const toLink = ACTIONS[cta?.action];
  if (!label || !toLink) return null;
  const link = toLink(cta.target?.trim() ?? '', context);
  return link ? { label, ...link } : null;
}

/** `ctaLink` context from the public settings. */
export const ctaContext = (settings) => ({
  email: settings?.contactEmail,
  whatsapp: settings?.whatsapp,
  cvUrl: settings?.cv?.url,
  cvName: settings?.cv?.name,
});
